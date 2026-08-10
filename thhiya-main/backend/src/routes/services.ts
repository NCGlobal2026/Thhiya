import { Hono } from 'hono';
import serviceController from '../controllers/serviceController';
import { CachePresets } from '../middleware';

const router: any = new Hono();

// Apply cache headers to all GET requests - services are static data
router.use('*', CachePresets.static);

/**
 * @route   GET /api/services
 * @desc    Get all services
 * @access  Public
 */
router.get('/', (c: any) => serviceController.list(c));

/**
 * @route   GET /api/services/category/:category
 * @desc    Get services by category
 * @access  Public
 */
router.get('/category/:category', (c: any) => serviceController.getByCategory(c));

/**
 * @route   GET /api/services/:slug
 * @desc    Get service by slug
 * @access  Public
 */
router.get('/:slug', (c: any) => serviceController.getBySlug(c));

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (Admin)
 */
router.post('/', (c: any) => serviceController.create(c));

export default router;
