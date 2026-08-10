import { Hono } from 'hono';
import bantController from '../controllers/bantController';
import { formRateLimiter } from '../middleware';

const router: any = new Hono();

/**
 * @route   GET /api/bant/options
 * @desc    Get form options/metadata for the BANT/MEDDIC/INTENT(BMI) form
 * @access  Public
 */
router.get('/options', (c: any) => bantController.getFormOptions(c));

/**
 * @route   POST /api/bant/submit
 * @desc    Submit a new BANT/MEDDIC/INTENT(BMI) form (no auth required)
 * @access  Public
 * @rateLimit 5 requests per minute
 */
router.post('/submit', formRateLimiter as any, (c: any) => bantController.submit(c));

/**
 * @route   GET /api/bant/submissions
 * @desc    Get all BANT/MEDDIC/INTENT(BMI) submissions with pagination and filters
 * @access  Private (Admin)
 */
router.get('/submissions', (c: any) => bantController.list(c));

/**
 * @route   GET /api/bant/submissions/stats
 * @desc    Get submission statistics
 * @access  Private (Admin)
 */
router.get('/submissions/stats', (c: any) => bantController.getStats(c));

/**
 * @route   GET /api/bant/submissions/:id
 * @desc    Get a single submission by ID
 * @access  Private (Admin)
 */
router.get('/submissions/:id', (c: any) => bantController.getById(c));

/**
 * @route   PATCH /api/bant/submissions/:id
 * @desc    Update a submission (status, notes, etc.)
 * @access  Private (Admin)
 */
router.patch('/submissions/:id', (c: any) => bantController.update(c));

/**
 * @route   DELETE /api/bant/submissions/:id
 * @desc    Delete a submission
 * @access  Private (Admin)
 */
router.delete('/submissions/:id', (c: any) => bantController.delete(c));

export default router;
