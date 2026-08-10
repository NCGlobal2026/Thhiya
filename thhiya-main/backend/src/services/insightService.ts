import Insight, { IInsight } from '../models/Insight';
import Service from '../models/Service';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+services?$/i, '') // drop trailing "services" / "service"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const caseInsensitiveMatch = (value: string) => ({ $regex: new RegExp(`^${value}$`, 'i') });

export class InsightService {
  async getInsightByServiceAndCountry(service: string, country: string): Promise<IInsight | null> {
    try {
      const serviceSlug = slugify(service);

      // First attempt - match by human label or serviceSlug
      let insight = await Insight.findOne({
        country: caseInsensitiveMatch(country),
        $or: [
          { service: caseInsensitiveMatch(service) },
          { serviceSlug }
        ]
      });

      if (insight) return insight;

      // If not found, try to look up a canonical Service by slug. This helps
      // when the frontend supplies a slug for a Service that's stored in
      // Service model but the Insight has a slightly different label.
      const serviceDoc = await Service.findOne({ slug: serviceSlug });
      if (serviceDoc) {
        insight = await Insight.findOne({
          country: caseInsensitiveMatch(country),
          service: caseInsensitiveMatch(serviceDoc.name)
        });
      }

      return insight;
    } catch (error) {
      throw new Error(`Error fetching insight: ${error}`);
    }
  }

  async getAllInsights(filter?: { service?: string; country?: string }): Promise<IInsight[]> {
    try {
      const query: Record<string, unknown> = {};

      if (filter?.service) {
        // Match on human-friendly name OR canonical slug
        const slug = slugify(filter.service);
        query.$or = [
          { service: caseInsensitiveMatch(filter.service) },
          { serviceSlug: slug }
        ];
      }

      if (filter?.country) {
        query.country = caseInsensitiveMatch(filter.country);
      }

      return await Insight.find(query).sort({ service: 1, country: 1 });
    } catch (error) {
      throw new Error(`Error fetching insights: ${error}`);
    }
  }

  async getInsightsByService(service: string): Promise<IInsight[]> {
    try {
      const slug = slugify(service);
      return await Insight.find({
        $or: [
          { service: caseInsensitiveMatch(service) },
          { serviceSlug: slug }
        ]
      }).sort({ country: 1 });
    } catch (error) {
      throw new Error(`Error fetching insights by service: ${error}`);
    }
  }

  async getInsightsByCountry(country: string): Promise<IInsight[]> {
    try {
      return await Insight.find({ country: caseInsensitiveMatch(country) }).sort({ service: 1 });
    } catch (error) {
      throw new Error(`Error fetching insights by country: ${error}`);
    }
  }

  async getServicesList(): Promise<string[]> {
    try {
      return await Insight.distinct('service');
    } catch (error) {
      throw new Error(`Error fetching services: ${error}`);
    }
  }

  async getCountriesList(): Promise<string[]> {
    try {
      const countries = await Insight.distinct('country');
      return countries.sort();
    } catch (error) {
      throw new Error(`Error fetching countries: ${error}`);
    }
  }

  async getCountriesByService(service: string): Promise<string[]> {
    try {
      const slug = slugify(service);
      const countries = await Insight.find({
        $or: [
          { service: caseInsensitiveMatch(service) },
          { serviceSlug: slug }
        ]
      }).distinct('country');
      return countries;
    } catch (error) {
      throw new Error(`Error fetching countries for service: ${error}`);
    }
  }
}

export default new InsightService();
