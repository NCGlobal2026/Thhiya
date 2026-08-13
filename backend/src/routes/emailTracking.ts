import { Hono } from 'hono';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import EmailTracking from '../models/EmailTracking';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const emailTrackingRoutes = new Hono();

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

/**
 * Track email open via tracking pixel (PUBLIC)
 * GET /api/email/track/open/:trackingId
 */
emailTrackingRoutes.get('/open/:trackingId', async (c) => {
    const { trackingId } = c.req.param();
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';
    emailService.recordOpen(trackingId, { ipAddress, userAgent }).catch(err => {
        logger.error('Failed to record email open', err);
    });
    return new Response(TRACKING_PIXEL, {
        status: 200,
        headers: {
            'Content-Type': 'image/gif',
            'Content-Length': TRACKING_PIXEL.length.toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
});

/**
 * Track email link click and redirect (PUBLIC)
 * GET /api/email/track/click/:trackingId
 */
emailTrackingRoutes.get('/click/:trackingId', async (c) => {
    const { trackingId } = c.req.param();
    const url = c.req.query('url');
    if (!url) {
        return c.text('Invalid redirect URL', 400);
    }
    const decodedUrl = decodeURIComponent(url);
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';
    emailService.recordClick(trackingId, decodedUrl, { ipAddress, userAgent }).catch(err => {
        logger.error('Failed to record email click', err);
    });
    return c.redirect(decodedUrl, 302);
});

/**
 * Get email tracking statistics (ADMIN)
 */
emailTrackingRoutes.get('/stats', requireAuth, requireAdmin, async (c) => {
    try {
        const stats = await emailService.getTrackingStats();
        return c.json({ success: true, data: stats });
    } catch (error) {
        logger.error('Failed to get email tracking stats', error);
        return c.json({ success: false, error: 'Failed to retrieve statistics' }, 500);
    }
});

/**
 * Get all email tracking records with pagination (ADMIN)
 */
emailTrackingRoutes.get('/records', requireAuth, requireAdmin, async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1', 10);
        const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
        const status = c.req.query('status');
        const type = c.req.query('type');
        const skip = (page - 1) * limit;
        const filter: any = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        const [records, total] = await Promise.all([
            EmailTracking.find(filter).sort({ sentAt: -1 }).skip(skip).limit(limit).lean(),
            EmailTracking.countDocuments(filter),
        ]);
        return c.json({
            success: true,
            data: {
                records,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        logger.error('Failed to get email tracking records', error);
        return c.json({ success: false, error: 'Failed to retrieve records' }, 500);
    }
});

/**
 * Get email tracking for a specific submission (ADMIN)
 */
emailTrackingRoutes.get('/submission/:submissionId', requireAuth, requireAdmin, async (c) => {
    const { submissionId } = c.req.param();
    try {
        const records = await emailService.getTrackingForSubmission(submissionId);
        return c.json({ success: true, data: records });
    } catch (error) {
        logger.error('Failed to get tracking for submission', error);
        return c.json({ success: false, error: 'Failed to retrieve tracking data' }, 500);
    }
});

/**
 * Get a single email tracking record by ID (ADMIN)
 */
emailTrackingRoutes.get('/:trackingId/details', requireAuth, requireAdmin, async (c) => {
    const { trackingId } = c.req.param();
    try {
        const record = await EmailTracking.findOne({ trackingId }).lean();
        if (!record) {
            return c.json({ success: false, error: 'Tracking record not found' }, 404);
        }
        return c.json({ success: true, data: record });
    } catch (error) {
        logger.error('Failed to get tracking record', error);
        return c.json({ success: false, error: 'Failed to retrieve tracking record' }, 500);
    }
});

export default emailTrackingRoutes;
