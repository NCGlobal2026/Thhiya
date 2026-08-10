import { Hono } from 'hono';
import {
    getBlogs,
    getBlogBySlug,
    getCategories,
    getTags,
    getRelatedBlogs
} from '../controllers/blogController';

const blogsRoutes = new Hono();

// GET /api/blogs - List all published blogs (paginated)
blogsRoutes.get('/', getBlogs);

// GET /api/blogs/categories - Get all categories with counts
blogsRoutes.get('/categories', getCategories);

// GET /api/blogs/tags - Get all tags with counts
blogsRoutes.get('/tags', getTags);

// GET /api/blogs/:slug - Get single blog by slug
blogsRoutes.get('/:slug', getBlogBySlug);

// GET /api/blogs/:slug/related - Get related blogs
blogsRoutes.get('/:slug/related', getRelatedBlogs);

export default blogsRoutes;
