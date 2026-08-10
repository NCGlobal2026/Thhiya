import { Context } from 'hono';
import Service from '../models/Service';
import { TOP_13_SERVICES } from '../utils/serviceConstants';
import { logger } from '../utils/logger';

class ServiceController {
  async list(c: Context) {
    try {
      const services = await Service.find({ isActive: true }).sort({ name: 1 });
      const filteredServices = services.filter(s => TOP_13_SERVICES.includes(s.slug));

      return c.json({
        success: true,
        data: filteredServices,
        count: filteredServices.length
      });
    } catch (error) {
      logger.error('Failed to fetch services', error);
      return c.json({
        success: false,
        message: 'Failed to fetch services'
      }, 500);
    }
  }

  async getBySlug(c: Context) {
    try {
      const slug = c.req.param('slug')?.toLowerCase();
      const service = await Service.findOne({ slug, isActive: true });

      if (!service) {
        return c.json({
          success: false,
          message: 'Service not found'
        }, 404);
      }

      return c.json({
        success: true,
        data: service
      });
    } catch (error) {
      logger.error('Failed to fetch service by slug', error);
      return c.json({
        success: false,
        message: 'Failed to fetch service'
      }, 500);
    }
  }

  async getByCategory(c: Context) {
    try {
      const category = c.req.param('category');
      const services = await Service.find({ category, isActive: true }).sort({ name: 1 });

      return c.json({
        success: true,
        data: services,
        count: services.length
      });
    } catch (error) {
      logger.error('Failed to fetch services by category', error);
      return c.json({
        success: false,
        message: 'Failed to fetch services by category'
      }, 500);
    }
  }

  async create(c: Context) {
    try {
      const payload = await c.req.json();
      const service = await Service.create(payload);
      return c.json({
        success: true,
        data: service
      }, 201);
    } catch (error) {
      logger.error('Failed to create service', error);
      return c.json({
        success: false,
        message: 'Failed to create service'
      }, 400);
    }
  }
}

export default new ServiceController();
