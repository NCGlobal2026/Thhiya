import { Context } from 'hono';
type JsonResponse = Response | Promise<Response>;
import Country from '../models/Country';
import Insight from '../models/Insight';
import CountryService from '../models/CountryService';
import { TOP_13_SERVICES } from '../utils/serviceConstants';

type ServiceSummary = {
  service: string;
  count: number;
};

type CountryPreview = {
  employmentCost?: string;
  annualLeave?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildServiceSummary = async (countryNames: string[]) => {
  if (!countryNames.length) {
    return new Map<string, { total: number; services: ServiceSummary[] }>();
  }
  // Get insight counts grouped by country and service (existing insight entries)
  const summaries = await Insight.aggregate<{
    _id: { country: string; service: string };
    count: number;
  }>([
    {
      $match: {
        country: { $in: countryNames },
        serviceSlug: { $in: TOP_13_SERVICES }
      }
    },
    {
      $group: {
        _id: { country: '$country', service: '$service' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Fetch country-service presence from CountryService, so we include
  // all services even if there are no insights yet for them.
  const presences = await CountryService.aggregate<{
    _id: { country: string; service: string };
    count: number;
  }>([
    {
      $match: {
        country: { $in: countryNames },
        serviceSlug: { $in: TOP_13_SERVICES },
        isActive: true
      }
    },
    { $group: { _id: { country: '$country', service: '$service' }, count: { $sum: 1 } } }
  ]);

  // Build a map using presence as the base (ensures all services are included)
  const acc = presences.reduce((map, entry) => {
    const { country, service } = entry._id;
    const existing = map.get(country) ?? { total: 0, services: [] as ServiceSummary[] };
    // presence doesn't increase count; we'll merge insight counts later
    existing.services.push({ service, count: 0 });
    map.set(country, existing);
    return map;
  }, new Map<string, { total: number; services: ServiceSummary[] }>());

  // Merge insight counts into the map, updating counts and totals
  for (const entry of summaries) {
    const { country, service } = entry._id;
    const count = entry.count;
    const existing = acc.get(country) ?? { total: 0, services: [] as ServiceSummary[] };
    const serviceIndex = existing.services.findIndex(s => s.service === service);
    if (serviceIndex >= 0) {
      existing.services[serviceIndex].count = (existing.services[serviceIndex].count ?? 0) + count;
    } else {
      existing.services.push({ service, count });
    }
    existing.total += count;
    acc.set(country, existing);
  }

  return acc;
};

const toText = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toText).join(' ');
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(toText).join(' ');
  return '';
};

const extractEmploymentCost = (sections: any[]): string | undefined => {
  const costSection = sections.find((section: any) => section?.type === 'cost_breakdown');
  const rows = costSection?.content?.table?.rows;
  if (!Array.isArray(rows) || rows.length === 0) return undefined;

  const preferredLabelMatchers = [
    /employer\s*cost/i,
    /total\s*cost/i,
    /cost\s*burden/i,
    /employer\s*contribution/i,
    /management\s*fee/i
  ];

  const preferredRow = rows.find((row: any) =>
    preferredLabelMatchers.some((pattern) => pattern.test(String(row?.label || '')))
  ) || rows.find((row: any) => row?.highlight) || rows[0];

  const value = preferredRow?.values?.[0];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const extractAnnualLeave = (sections: any[]): string | undefined => {
  const textBlob = sections
    .map((section: any) => {
      const parts = [
        section?.title,
        section?.subtitle,
        section?.description,
        toText(section?.content)
      ];
      return parts.map(toText).join(' ');
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!textBlob) return undefined;

  const leavePatterns = [
    /(\d{1,2}(?:\s*(?:-|to)\s*\d{1,2})?\s*(?:work\s*)?days?)\s*(?:of\s*)?(?:paid\s*)?(?:annual\s*)?(?:leave|holiday|holidays|vacation)/i,
    /(?:annual\s*leave|paid\s*time\s*off|vacation|holidays?)\s*[:\-]?\s*(\d{1,2}(?:\s*(?:-|to)\s*\d{1,2})?\s*(?:work\s*)?days?)/i
  ];

  for (const pattern of leavePatterns) {
    const match = textBlob.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
};

const buildCountryPreviews = async (countryNames: string[]) => {
  if (!countryNames.length) {
    return new Map<string, CountryPreview>();
  }

  const preferredServiceOrder = ['eor-peo-aor', 'accounting-compliances', ...TOP_13_SERVICES];
  const servicePriority = new Map(preferredServiceOrder.map((slug, index) => [slug, index]));

  const services = await CountryService.find({
    country: { $in: countryNames },
    isActive: true,
    serviceSlug: { $in: TOP_13_SERVICES }
  })
    .select('country serviceSlug sections')
    .lean();

  const grouped = services.reduce((acc, service: any) => {
    const key = service.country;
    if (!acc.has(key)) acc.set(key, [] as any[]);
    acc.get(key)?.push(service);
    return acc;
  }, new Map<string, any[]>());

  const previews = new Map<string, CountryPreview>();

  for (const countryName of countryNames) {
    const countryServices = grouped.get(countryName) || [];
    if (!countryServices.length) continue;

    countryServices.sort((a, b) => {
      const aPriority = servicePriority.get(a.serviceSlug) ?? 999;
      const bPriority = servicePriority.get(b.serviceSlug) ?? 999;
      return aPriority - bPriority;
    });

    let employmentCost: string | undefined;
    let annualLeave: string | undefined;

    for (const service of countryServices) {
      const sections = Array.isArray(service.sections) ? service.sections : [];
      if (!employmentCost) employmentCost = extractEmploymentCost(sections);
      if (!annualLeave) annualLeave = extractAnnualLeave(sections);
      if (employmentCost && annualLeave) break;
    }

    previews.set(countryName, {
      employmentCost,
      annualLeave
    });
  }

  return previews;
};

class CountryController {
  async list(c: Context): Promise<JsonResponse> {
    try {
      const countries = await Country.find({ isActive: true })
        .sort({ name: 1 })
        .limit(195)
        .lean();

      const countryNames = countries.map((country) => country.name);
      const [summaryMap, previewMap] = await Promise.all([
        buildServiceSummary(countryNames),
        buildCountryPreviews(countryNames)
      ]);
      const enhancedCountries = countries.map((country) => {
        const summary = summaryMap.get(country.name);
        const preview = previewMap.get(country.name);
        const services = summary?.services.sort((a, b) => b.count - a.count) ?? [];
        const defaultService = country.defaultService ?? services[0]?.service;

        return {
          ...country,
          employmentCost: preview?.employmentCost || country.employmentCost,
          annualLeave: preview?.annualLeave || country.annualLeave,
          defaultService,
          insightCount: summary?.total ?? 0,
          serviceSummary: services
        };
      });

      return c.json({
        success: true,
        data: enhancedCountries,
        count: enhancedCountries.length
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      return c.json({
        success: false,
        message: 'Error fetching countries',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }

  async getByCode(c: Context): Promise<JsonResponse> {
    try {
      const code = c.req.param('code')?.toUpperCase();
      const country = await Country.findOne({ code, isActive: true }).lean();

      if (!country) {
        return c.json({
          success: false,
          message: 'Country not found'
        }, 404);
      }

      const [summaryMap, previewMap] = await Promise.all([
        buildServiceSummary([country.name]),
        buildCountryPreviews([country.name])
      ]);
      const summary = summaryMap.get(country.name);
      const preview = previewMap.get(country.name);
      const services = summary?.services.sort((a, b) => b.count - a.count) ?? [];
      const defaultService = country.defaultService ?? services[0]?.service;

      return c.json({
        success: true,
        data: {
          ...country,
          employmentCost: preview?.employmentCost || country.employmentCost,
          annualLeave: preview?.annualLeave || country.annualLeave,
          defaultService,
          insightCount: summary?.total ?? 0,
          serviceSummary: services
        }
      });
    } catch (error) {
      console.error('Error fetching country:', error);
      return c.json({
        success: false,
        message: 'Error fetching country',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  }

  async create(c: Context): Promise<JsonResponse> {
    try {
      const payload = await c.req.json();

      if (!payload.name) {
        return c.json({
          success: false,
          message: 'Country name is required'
        }, 400);
      }

      payload.slug = payload.slug ?? slugify(payload.name);
      payload.code = payload.code?.toUpperCase();
      payload.servicesOffered = payload.servicesOffered ?? (payload.defaultService ? [payload.defaultService] : []);
      payload.languages = payload.languages ?? [];

      const country = await Country.create(payload);
      return c.json({
        success: true,
        data: country
      }, 201);
    } catch (error) {
      console.error('Error creating country:', error);
      return c.json({
        success: false,
        message: 'Error creating country',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 400);
    }
  }
}

export default new CountryController();
