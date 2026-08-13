import { Hono } from 'hono';
import { listingController } from '../controllers/listingController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = new Hono();

// Request a new listing (authenticated users)
router.post('/request', requireAuth, listingController.submitRequest);
router.get('/my-request', requireAuth, listingController.getMyRequest);
router.put('/my-request', requireAuth, listingController.upsertMyRequest);
router.patch('/my-request/plan', requireAuth, listingController.updateMyRequestPlan);

// Purple Listings (public read endpoints)
router.get('/purple/meta', listingController.getPurpleListingMeta);
router.get('/purple', listingController.getPurpleListings);
router.get('/purple/:slug', listingController.getPurpleListingBySlug);

// Admin seed endpoint (now protected)
router.post('/seed-purple', requireAuth, requireAdmin, listingController.seedPurpleListings);

export default router;
