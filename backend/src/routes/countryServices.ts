import { Hono } from 'hono';
import { countryServiceController } from '../controllers/countryServiceController';

const countryServices = new Hono();

/**
 * Country Services Routes
 * Handles dynamic country-service page data
 * 
 * Routes:
 * - GET /metadata         - Get countries, services, regions metadata
 * - GET /regions          - Get all regions with their countries
 * - GET /service/:slug    - Get all countries for a specific service
 * - GET /                 - Get all country-services (with filters)
 * - GET /:country         - Get all services for a country
 * - GET /:country/:service - Get specific country-service details
 */

// Static routes first (order matters in Hono)
countryServices.get('/metadata', countryServiceController.getMetadata);
countryServices.get('/regions', countryServiceController.getRegions);
countryServices.get('/service/:serviceSlug', countryServiceController.getCountriesByService);

// Get all country-services (with optional filters)
countryServices.get('/', countryServiceController.getAllCountryServices);

// Get all services for a specific country
countryServices.get('/:country', countryServiceController.getServicesByCountry);

// Get specific country-service details
countryServices.get('/:country/:service', countryServiceController.getCountryService);

export default countryServices;
