import { Hono } from 'hono';
import providerController from '../controllers/providerController';

const router: any = new Hono();

router.get('/', (c: any) => providerController.getAllProviders(c));
router.get('/intent-refresh/status', (c: any) => providerController.getIntentRefreshStatus(c));
router.get('/service/:service', (c: any) => providerController.getProvidersByService(c));
router.get('/country/:country', (c: any) => providerController.getProvidersByCountry(c));
// Search/match by query string
router.get('/match', (c: any) => providerController.findMatches(c));
router.get('/slug/:slug', (c: any) => providerController.getProviderBySlug(c));

export default router;
