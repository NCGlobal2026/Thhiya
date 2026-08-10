import { Context } from 'hono';
import providerService from '../services/providerService';
import Provider from '../models/Provider';
import IntentRefreshJob from '../models/IntentRefreshJob';
import { logger } from '../utils/logger';

class ProviderController {
  async getAllProviders(c: Context) {
    try {
      const providers = await providerService.getAllProviders();
      return c.json({ success: true, data: providers, count: providers.length });
    } catch (err) {
      logger.error('Failed to get all providers', err);
      return c.json({ success: false, message: 'Internal server error' }, 500);
    }
  }

  async getProvidersByService(c: Context) {
    try {
      const service = c.req.param('service') || c.req.query('service');
      if (!service) return c.json({ success: false, message: 'Service parameter required' }, 400);
      const providers = await providerService.getProvidersByService(service);
      return c.json({ success: true, data: providers, count: providers.length });
    } catch (err) {
      logger.error('Failed to get providers by service', err);
      return c.json({ success: false, message: 'Internal server error' }, 500);
    }
  }

  async getProvidersByCountry(c: Context) {
    try {
      const country = c.req.param('country') || c.req.query('country');
      if (!country) return c.json({ success: false, message: 'Country parameter required' }, 400);
      const providers = await providerService.getProvidersByCountry(country);
      return c.json({ success: true, data: providers, count: providers.length });
    } catch (err) {
      logger.error('Failed to get providers by country', err);
      return c.json({ success: false, message: 'Internal server error' }, 500);
    }
  }

  async findMatches(c: Context) {
    try {
      const service = c.req.query('service');
      const country = c.req.query('country');
      if (!service) return c.json({ success: false, message: 'Service is required' }, 400);
      const matches = await providerService.findMatches(service, country || undefined);
      return c.json({ success: true, data: matches, count: matches.length });
    } catch (err) {
      logger.error('Failed to find matches', err);
      return c.json({ success: false, message: 'Internal server error' }, 500);
    }
  }

  async getIntentRefreshStatus(c: Context) {
    try {
      const activeProviderFilter = {
        $or: [
          { isActive: true },
          { isActive: { $exists: false } },
        ],
      };

      const [latestJob, totalProviders, providersWithIntent, providersMissingIntent] = await Promise.all([
        IntentRefreshJob.findOne().sort({ startedAt: -1 }).lean(),
        Provider.countDocuments(activeProviderFilter),
        Provider.countDocuments({
          $and: [
            activeProviderFilter,
            {
              intentScore: { $exists: true },
              scoringFactors: { $exists: true },
              sentimentAnalysis: { $exists: true },
            },
          ],
        }),
        Provider.countDocuments({
          $and: [
            activeProviderFilter,
            {
              $or: [
                { intentScore: { $exists: false } },
                { scoringFactors: { $exists: false } },
                { sentimentAnalysis: { $exists: false } },
              ],
            },
          ],
        }),
      ]);

      return c.json({
        success: true,
        data: {
          totalProviders,
          providersWithIntent,
          providersMissingIntent,
          latestJob,
          nextEligibleRunAt: latestJob?.nextEligibleRunAt ?? null,
        },
      });
    } catch (err) {
      logger.error('Failed to get provider intent refresh status', err);
      return c.json({ success: false, message: 'Internal server error' }, 500);
    }
  }

  async getProviderBySlug(c: Context) {
    try {
      const slug = c.req.param('slug');
      if (!slug) return c.json({ success: false, message: 'Slug parameter required' }, 400);

      const provider = await providerService.getProviderBySlug(slug);
      if (!provider) {
        return c.json({ success: false, message: 'Provider not found' }, 404);
      }
      return c.json({ success: true, data: provider });
    } catch (err) {
      logger.error('Failed to get provider by slug', err);
      return c.json({ success: false, message: 'Internal server error' }, 500);
    }
  }
}

export default new ProviderController();
