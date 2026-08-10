import { Context } from 'hono';
import CountryService from '../models/CountryService';
import Service from '../models/Service';
import { TOP_13_SERVICES } from '../utils/serviceConstants';
import { logger } from '../utils/logger';

/**
 * Controller for CountryService endpoints
 * Handles requests for dynamic country-service pages
 */

export const countryServiceController = {
  /**
   * GET /api/country-services
   * List all country-service combinations (optionally filtered)
   * Query params: country, service, region, isActive
   */
  async getAllCountryServices(c: Context) {
    try {
      const { country, service, region, isActive } = c.req.query();

      // We'll build an $and array of clauses to logically AND country and service filters
      const andClauses: any[] = [];
      if (country) {
        andClauses.push({
          $or: [
            { country: { $regex: new RegExp(`^${country}$`, 'i') } },
            { countrySlug: { $regex: new RegExp(`^${country}$`, 'i') } },
            { countryCode: { $regex: new RegExp(`^${country}$`, 'i') } }
          ]
        });
      }
      if (service) {
        // Try to resolve a canonical service slug
        const masterService = await Service.findOne({
          $or: [
            { slug: service.toLowerCase() },
            { name: { $regex: new RegExp(`^${service}$`, 'i') } }
          ]
        }).select('slug').lean();

        const serviceSearch = masterService?.slug || service.toLowerCase();
        andClauses.push({ serviceSlug: serviceSearch });
      }
      if (region) {
        andClauses.push({ region: { $regex: new RegExp(`^${region}$`, 'i') } });
      }
      if (isActive !== undefined) {
        andClauses.push({ isActive: isActive === 'true' });
      }

      // Ensure we only return services for the top 195 countries
      const topCountries = await (await import('../models/Country')).default.find({ isActive: true })
        .sort({ name: 1 })
        .limit(195)
        .select('slug')
        .lean();
      const topCountrySlugs = topCountries.map(c => c.slug);

      const filter: any = andClauses.length ? { $and: andClauses } : {};
      if (filter.$and) {
        filter.$and.push({ countrySlug: { $in: topCountrySlugs } });
      } else {
        filter.countrySlug = { $in: topCountrySlugs };
      }

      const services = await CountryService.find(filter)
        .select('country countryCode countrySlug region service serviceSlug serviceNumber heroData.description heroData.title isActive')
        .sort({ country: 1, serviceNumber: 1 });

      // Ensure we only return the top 12 canonical services
      const filteredServices = services.filter(s => TOP_13_SERVICES.includes(s.serviceSlug));

      return c.json({
        success: true,
        count: filteredServices.length,
        data: filteredServices
      });
    } catch (error) {
      logger.error('Failed to fetch country services', error);
      return c.json({
        success: false,
        error: 'Failed to fetch country services'
      }, 500);
    }
  },

  /**
   * GET /api/country-services/:country/:service
   * Get full details for a specific country-service page
   */
  async getCountryService(c: Context) {
    try {
      const { country, service } = c.req.param();

      const normalize = (value: string) =>
        String(value || '')
          .toLowerCase()
          .trim()
          .replace(/\s+services?$/i, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const normalizedCountry = normalize(country);
      const normalizedService = normalize(service);

      // 1. Try to find canonical service slug
      const masterService = await Service.findOne({
        $or: [
          { slug: normalizedService },
          { name: { $regex: new RegExp(`^${service}$`, 'i') } }
        ]
      }).select('slug').lean();

      const serviceSlug = masterService?.slug || normalizedService;

      // 2. Query CountryService with the canonical slug
      const countryService = await CountryService.findOne({
        $and: [
          { isActive: true },
          {
            $or: [
              { countrySlug: normalizedCountry },
              { countryCode: country.toUpperCase() },
              { country: { $regex: new RegExp(`^${country}$`, 'i') } }
            ]
          },
          { serviceSlug: serviceSlug }
        ]
      });

      if (!countryService) {
        return c.json({
          success: false,
          error: 'Country service not found'
        }, 404);
      }

      return c.json({
        success: true,
        data: countryService
      });
    } catch (error) {
      logger.error('Failed to fetch country service', error);
      return c.json({
        success: false,
        error: 'Failed to fetch country service'
      }, 500);
    }
  },

  /**
   * GET /api/country-services/:country
   * Get all services for a specific country
   */
  async getServicesByCountry(c: Context) {
    try {
      const { country } = c.req.param();

      const services = await CountryService.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { countrySlug: { $regex: new RegExp(`^${country}$`, 'i') } },
              { country: { $regex: new RegExp(`^${country}$`, 'i') } },
              { countryCode: { $regex: new RegExp(`^${country}$`, 'i') } }
            ]
          }
        ]
      })
        .select('country countryCode countrySlug region service serviceSlug serviceNumber heroData ctaText ctaLink')
        .sort({ serviceNumber: 1 });

      const filteredServices = services.filter(s => TOP_13_SERVICES.includes(s.serviceSlug));

      if (filteredServices.length === 0) {
        return c.json({
          success: false,
          error: 'No services found for this country'
        }, 404);
      }

      return c.json({
        success: true,
        country: filteredServices[0].country,
        countryCode: filteredServices[0].countryCode,
        countrySlug: filteredServices[0].countrySlug,
        region: filteredServices[0].region,
        count: filteredServices.length,
        data: filteredServices
      });
    } catch (error) {
      logger.error('Failed to fetch services by country', error);
      return c.json({
        success: false,
        error: 'Failed to fetch services'
      }, 500);
    }
  },

  /**
   * GET /api/country-services/metadata
   * Get available countries, services, and regions
   */
  async getMetadata(c: Context) {
    try {
      // 1. Fetch ALL active countries from Country collection - limited to 195
      const allCountries = await (await import('../models/Country')).default.find({ isActive: true })
        .select('name code slug region')
        .sort({ name: 1 })
        .limit(195)
        .lean();

      const topCountrySlugs = allCountries.map((c: any) => c.slug);

      // 2. Get service counts grouped by country (filtered by TOP 195 Countries and TOP 12 Services)
      const serviceCounts = await CountryService.aggregate([
        {
          $match: {
            isActive: true,
            countrySlug: { $in: topCountrySlugs },
            serviceSlug: { $in: TOP_13_SERVICES }
          }
        },
        {
          $group: {
            _id: '$countrySlug',
            serviceCount: { $sum: 1 },
            country: { $first: '$country' },
            countryCode: { $first: '$countryCode' },
            region: { $first: '$region' }
          }
        }
      ]);
      const serviceCountMap = new Map(serviceCounts.map((s: any) => [s._id, s]));

      const countries = allCountries.map((c: any) => {
        const key = c.slug;
        const svc = serviceCountMap.get(key);
        return {
          slug: key,
          name: c.name,
          code: c.code,
          region: c.region || svc?.region || 'Other',
          serviceCount: svc ? svc.serviceCount : 0
        };
      }).sort((a: any, b: any) => a.name.localeCompare(b.name));

      // 3. Get unique services (filtered by TOP 195 Countries and TOP 12 Services)
      const servicesAgg = await CountryService.aggregate([
        {
          $match: {
            isActive: true,
            countrySlug: { $in: topCountrySlugs },
            serviceSlug: { $in: TOP_13_SERVICES }
          }
        },
        {
          $group: {
            _id: '$serviceSlug',
            service: { $first: '$service' },
            countryCount: { $sum: 1 }
          }
        }
      ]);

      const aggServiceMap = new Map(servicesAgg.map((s: any) => [s._id, s.countryCount]));

      // Get all base services to ensure we have all 13 regardless of country count
      const baseServices = await (await import('../models/Service')).default.find({
        isActive: true,
        slug: { $in: TOP_13_SERVICES }
      }).select('slug name').lean();

      // Merge base services with aggregated counts
      const finalServicesList = baseServices.map((bs: any) => ({
        slug: bs.slug,
        name: bs.name,
        countryCount: aggServiceMap.get(bs.slug) || 0
      })).sort((a, b) => a.name.localeCompare(b.name));

      // 4. Get regions with country count (filtered by TOP 195 Countries and TOP 12 Services)
      const regionsAgg = await CountryService.aggregate([
        {
          $match: {
            isActive: true,
            countrySlug: { $in: topCountrySlugs },
            serviceSlug: { $in: TOP_13_SERVICES }
          }
        },
        { $group: { _id: { region: '$region', country: '$country' } } },
        { $group: { _id: '$_id.region', countryCount: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // 5. Total Insights Count (the number of actual pages)
      const totalDocuments = await CountryService.countDocuments({
        isActive: true,
        countrySlug: { $in: topCountrySlugs },
        serviceSlug: { $in: TOP_13_SERVICES }
      });

      return c.json({
        success: true,
        data: {
          countries: countries,
          services: finalServicesList,
          regions: regionsAgg.map(r => ({
            name: r._id,
            countryCount: r.countryCount
          })),
          totalDocuments
        }
      });
    } catch (error) {
      logger.error('Failed to fetch metadata', error);
      return c.json({
        success: false,
        error: 'Failed to fetch metadata'
      }, 500);
    }
  },

  /**
   * GET /api/country-services/service/:serviceSlug
   * Get all countries offering a specific service
   */
  async getCountriesByService(c: Context) {
    try {
      const { serviceSlug } = c.req.param();
      const { region } = c.req.query();

      const normalize = (value: string) =>
        String(value || '')
          .toLowerCase()
          .trim()
          .replace(/\s+services?$/i, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const normalizedService = normalize(serviceSlug);

      const filter: any = {
        isActive: true,
        serviceSlug: normalizedService
      };

      if (region) {
        filter.region = { $regex: new RegExp(`^${region}$`, 'i') };
      }

      const countries = await CountryService.find(filter)
        .select('country countryCode countrySlug region service serviceSlug heroData sections ctaText ctaLink')
        .sort({ region: 1, country: 1 });

      if (countries.length === 0) {
        return c.json({
          success: false,
          error: 'No countries found for this service'
        }, 404);
      }

      // Group by region
      const byRegion = countries.reduce((acc: any, doc) => {
        if (!acc[doc.region]) {
          acc[doc.region] = [];
        }
        acc[doc.region].push(doc);
        return acc;
      }, {});

      return c.json({
        success: true,
        service: countries[0].service,
        serviceSlug: countries[0].serviceSlug,
        count: countries.length,
        byRegion,
        data: countries
      });
    } catch (error) {
      logger.error('Failed to fetch countries by service', error);
      return c.json({
        success: false,
        error: 'Failed to fetch countries'
      }, 500);
    }
  },

  /**
   * GET /api/country-services/regions
   * Get all regions with their countries
   */
  async getRegions(c: Context) {
    try {
      // Get the list of top 195 country slugs to ensure consistency
      const topCountries = await (await import('../models/Country')).default.find({ isActive: true })
        .sort({ name: 1 })
        .limit(195)
        .select('slug')
        .lean();
      const topCountrySlugs = topCountries.map(c => c.slug);

      const regions = await CountryService.aggregate([
        { $match: { isActive: true, countrySlug: { $in: topCountrySlugs } } },
        {
          $group: {
            _id: { region: '$region', countrySlug: '$countrySlug' },
            country: { $first: '$country' },
            countryCode: { $first: '$countryCode' },
            serviceCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.region',
            countries: {
              $push: {
                slug: '$_id.countrySlug',
                name: '$country',
                code: '$countryCode',
                serviceCount: '$serviceCount'
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return c.json({
        success: true,
        count: regions.length,
        data: regions.map(r => ({
          region: r._id,
          countryCount: r.countries.length,
          countries: r.countries.sort((a: any, b: any) => a.name.localeCompare(b.name))
        }))
      });
    } catch (error) {
      logger.error('Failed to fetch regions', error);
      return c.json({
        success: false,
        error: 'Failed to fetch regions'
      }, 500);
    }
  }
};
