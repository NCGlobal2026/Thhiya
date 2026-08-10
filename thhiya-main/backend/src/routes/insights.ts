import { Hono } from 'hono';
import insightController from '../controllers/insightController';
import { CachePresets } from '../middleware';

const router: any = new Hono();

// Apply cache headers - insights can be cached for 30 minutes
router.use('*', CachePresets.insights);

// Root handler supports optional query filtering (?service=&country=)
router.get('/', (c: any) => insightController.handleRoot(c));

// Legacy /all alias
router.get('/all', (c: any) => insightController.getAllInsights(c));

// Metadata for dropdowns
router.get('/metadata', (c: any) => insightController.getMetadata(c));

// Country helpers
router.get('/countries', (c: any) => insightController.getCountriesByService(c));
router.get('/countries/by-service/:service', (c: any) => insightController.getCountriesByService(c));

// Filter helpers
router.get('/service/:service', (c: any) => insightController.getInsightsByService(c));
router.get('/country/:country', (c: any) => insightController.getInsightsByCountry(c));

// Specific service-country pair
router.get('/pair/:service/:country', (c: any) => insightController.getInsight(c));

export default router;
