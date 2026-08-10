import { Hono } from 'hono';
import { listingController } from '../controllers/listingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = new Hono();

// Request a new listing
router.post('/request', authMiddleware, listingController.submitRequest);
router.get('/my-request', authMiddleware, listingController.getMyRequest);
router.put('/my-request', authMiddleware, listingController.upsertMyRequest);
router.patch('/my-request/plan', authMiddleware, listingController.updateMyRequestPlan);

// Purple Listings (public endpoints)
router.get('/purple/meta', listingController.getPurpleListingMeta);
router.get('/purple', listingController.getPurpleListings);
router.get('/purple/:slug', listingController.getPurpleListingBySlug);

// Admin / Seed endpoints (temporary/unprotected for this phase)
router.post('/seed-purple', listingController.seedPurpleListings);

export default router;
