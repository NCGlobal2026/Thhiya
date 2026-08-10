import { Hono } from 'hono';
import contactController from '../controllers/contactController';
import { formRateLimiter } from '../middleware';

const router: any = new Hono();

/**
 * @route   GET /api/contact/options
 * @desc    Get form options/metadata for the contact form
 * @access  Public
 */
router.get('/options', (c: any) => contactController.getFormOptions(c));

/**
 * @route   POST /api/contact/submit
 * @desc    Submit a new contact form (no auth required)
 * @access  Public
 * @rateLimit 5 requests per minute
 */
router.post('/submit', formRateLimiter as any, (c: any) => contactController.submit(c));

/**
 * @route   GET /api/contact/submissions
 * @desc    Get all contact submissions with pagination and filters
 * @access  Private (Admin)
 */
router.get('/submissions', (c: any) => contactController.list(c));

/**
 * @route   GET /api/contact/submissions/:id
 * @desc    Get a single submission by ID
 * @access  Private (Admin)
 */
router.get('/submissions/:id', (c: any) => contactController.getById(c));

/**
 * @route   PATCH /api/contact/submissions/:id
 * @desc    Update a submission (status, notes)
 * @access  Private (Admin)
 */
router.patch('/submissions/:id', (c: any) => contactController.update(c));

/**
 * @route   DELETE /api/contact/submissions/:id
 * @desc    Delete a submission
 * @access  Private (Admin)
 */
router.delete('/submissions/:id', (c: any) => contactController.delete(c));

export default router;
