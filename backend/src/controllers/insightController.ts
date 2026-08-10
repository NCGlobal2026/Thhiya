import { Context } from 'hono';
import insightService from '../services/insightService';
import CountryService from '../models/CountryService';
import Service from '../models/Service';
import { getInsightSchema } from '../utils/validators';
import { TOP_13_SERVICES } from '../utils/serviceConstants';
import { logger } from '../utils/logger';

class InsightController {
  async handleRoot(c: Context) {
    const hasServiceQuery = Boolean(c.req.query('service'));
    const hasCountryQuery = Boolean(c.req.query('country'));

    if (hasServiceQuery && hasCountryQuery) {
      return this.getInsight(c);
    }

    if (hasServiceQuery) {
      return this.getInsightsByService(c);
    }

    if (hasCountryQuery) {
      return this.getInsightsByCountry(c);
    }

    return this.getAllInsights(c);
  }

  async getAllInsights(c: Context) {
    try {
      const service = c.req.query('service') || undefined;
      const country = c.req.query('country') || undefined;
      const insights = await insightService.getAllInsights({ service, country });

      return c.json({
        success: true,
        data: insights,
        count: insights.length
      });
    } catch (error) {
      logger.error('Failed to get all insights', error);
      return c.json({
        success: false,
        message: 'Internal server error'
      }, 500);
    }
  }

  async getInsightsByService(c: Context) {
    try {
      const service = c.req.param('service') || c.req.query('service');

      if (!service) {
        return c.json({
          success: false,
          message: 'Service parameter is required'
        }, 400);
      }

      const insights = await insightService.getInsightsByService(service);
      return c.json({
        success: true,
        data: insights,
        count: insights.length
      });
    } catch (error) {
      logger.error('Failed to get insights by service', error);
      return c.json({
        success: false,
        message: 'Internal server error'
      }, 500);
    }
  }

  async getInsightsByCountry(c: Context) {
    try {
      const country = c.req.param('country') || c.req.query('country');

      if (!country) {
        return c.json({
          success: false,
          message: 'Country parameter is required'
        }, 400);
      }

      const insights = await insightService.getInsightsByCountry(country);
      return c.json({
        success: true,
        data: insights,
        count: insights.length
      });
    } catch (error) {
      logger.error('Failed to get insights by country', error);
      return c.json({
        success: false,
        message: 'Internal server error'
      }, 500);
    }
  }

  async getInsight(c: Context) {
    try {
      const service = c.req.param('service') || c.req.query('service');
      const country = c.req.param('country') || c.req.query('country');

      const validationResult = getInsightSchema.safeParse({ service, country });

      if (!validationResult.success) {
        return c.json({
          success: false,
          message: 'Validation error',
          details: validationResult.error.issues
        }, 400);
      }

      const insight = await insightService.getInsightByServiceAndCountry(
        validationResult.data.service,
        validationResult.data.country
      );

      if (!insight) {
        return c.json({
          success: false,
          message: `No insights available for ${validationResult.data.service} in ${validationResult.data.country}`
        }, 404);
      }

      return c.json({
        success: true,
        data: insight
      });
    } catch (error) {
      logger.error('Failed to get insight', error);
      return c.json({
        success: false,
        message: 'Internal server error'
      }, 500);
    }
  }

  async getMetadata(c: Context) {
    try {
      const [services, countries, servicesDetailDocs] = await Promise.all([
        insightService.getServicesList(),
        insightService.getCountriesList(),
        // Also include canonical service list from Service collection (name + slug) to aid frontend
        Service.find({ isActive: true, slug: { $in: TOP_13_SERVICES } }).select('name slug -_id').sort({ name: 1 })
      ]);
      const servicesDetail = servicesDetailDocs.map((d: any) => ({ name: d.name, slug: d.slug }));

      // Enforce 195 country limit
      const cappedCountries = countries.slice(0, 195);

      // Include any services defined in CountryService that may not be present
      // in the Insight collection or Service master list. This ensures the
      // frontend shows all available services (e.g., the full 12 services).
      const countryServices = await CountryService.distinct('service');
      const allServicesSet = new Set<string>([...services, ...countryServices]);
      const allServices = Array.from(allServicesSet)
        .filter((s): s is string => typeof s === 'string' && s.length > 0)
        .sort();

      // Add missing services to servicesDetail with a slug fallback
      const existingSlugs = new Set(servicesDetail.map(s => s.slug));
      const slugify = (value: string) =>
        (value || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      for (const s of allServices) {
        const slug = slugify(s);
        if (!existingSlugs.has(slug) && TOP_13_SERVICES.includes(slug)) {
          servicesDetail.push({ name: s, slug });
          existingSlugs.add(slug);
        }
      }

      // Final filter for allServices
      const filteredAllServices = allServices.filter(s => TOP_13_SERVICES.includes(slugify(s)));

      return c.json({
        success: true,
        data: {
          services: filteredAllServices,
          servicesDetail: servicesDetail.filter(s => TOP_13_SERVICES.includes(s.slug)),
          countries: cappedCountries
        }
      });
    } catch (error) {
      logger.error('Failed to get metadata', error);
      return c.json({
        success: false,
        message: 'Internal server error'
      }, 500);
    }
  }

  async getCountriesByService(c: Context) {
    try {
      const service = c.req.param('service') || c.req.query('service');

      if (!service) {
        return c.json({
          success: false,
          message: 'Service parameter is required'
        }, 400);
      }

      const countries = await insightService.getCountriesByService(service);
      return c.json({
        success: true,
        data: countries,
        count: countries.length
      });
    } catch (error) {
      logger.error('Failed to get countries by service', error);
      return c.json({
        success: false,
        message: 'Internal server error'
      }, 500);
    }
  }
}

export default new InsightController();
