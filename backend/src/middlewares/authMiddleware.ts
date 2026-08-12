import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Refusing to start without a signing secret.');
}

const extractToken = (c: Context): string | null => {
    const cookieToken = getCookie(c, 'auth_token');
    if (cookieToken) return cookieToken;
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
};

export const requireAuth = async (c: Context, next: Next) => {
    const token = extractToken(c);
    if (!token) {
        return c.json({ error: 'Unauthorized. Authentication required.' }, 401);
    }
    try {
        const payload = await verify(token, JWT_SECRET);
        c.set('user', payload);
        await next();
    } catch (err) {
        return c.json({ error: 'Unauthorized. Invalid or expired token.' }, 401);
    }
};

export const requireAdmin = async (c: Context, next: Next) => {
    const user = c.get('user') as { role?: string } | undefined;
    if (!user || user.role !== 'admin') {
        return c.json({ error: 'Forbidden. Admin access required.' }, 403);
    }
    await next();
};

export const authMiddleware = requireAuth;
