import { Hono } from 'hono';
import contactController from '../controllers/contactController';
import { formRateLimiter } from '../middleware';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware';

const router: any = new Hono();

router.get('/options', (c: any) => contactController.getFormOptions(c));

router.post('/submit', formRateLimiter as any, (c: any) => contactController.submit(c));

router.get('/submissions', requireAuth, requireAdmin, (c: any) => contactController.list(c));

router.get('/submissions/:id', requireAuth, requireAdmin, (c: any) => contactController.getById(c));

router.patch('/submissions/:id', requireAuth, requireAdmin, (c: any) => contactController.update(c));

router.delete('/submissions/:id', requireAuth, requireAdmin, (c: any) => contactController.delete(c));

export default router;
