import { Hono } from 'hono';
import countryController from '../controllers/countryController';
import { CachePresets } from '../middleware';

const router: any = new Hono();

// Apply cache headers to all GET requests - countries are static data
router.use('*', CachePresets.static);

/**
 * @route   GET /api/countries
 * @desc    Get all countries
 * @access  Public
 */
router.get('/', (c: any) => countryController.list(c));

/**
 * @route   GET /api/countries/:code
 * @desc    Get country by code
 * @access  Public
 */
router.get('/:code', (c: any) => countryController.getByCode(c));

/**
 * @route   POST /api/countries
 * @desc    Create a new country
 * @access  Private (Admin)
 */
router.post('/', (c: any) => countryController.create(c));

export default router;
