import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-change-in-prod';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized. Missing or invalid token format.' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = await verify(token, JWT_SECRET, "HS256");
        c.set('user', payload);
        await next();
    } catch (err) {
        return c.json({ error: 'Unauthorized. Invalid or expired token.' }, 401);
    }
};
