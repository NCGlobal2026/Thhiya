import { Context } from 'hono';
import Blog from '../models/Blog';

/**
 * Get all published blogs (paginated)
 */
export const getBlogs = async (c: Context) => {
    try {
        const page = parseInt(c.req.query('page') || '1', 10);
        const limit = parseInt(c.req.query('limit') || '10', 10);
        const category = c.req.query('category');
        const tag = c.req.query('tag');

        const query: any = { status: 'published' };

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag.toLowerCase();
        }

        const search = c.req.query('search');
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .select('-content') // Don't send full content in list view
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Blog.countDocuments(query)
        ]);

        return c.json({
            success: true,
            data: blogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + blogs.length < total
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return c.json({ success: false, error: 'Failed to fetch blogs' }, 500);
    }
};

/**
 * Get single blog by slug
 */
export const getBlogBySlug = async (c: Context) => {
    try {
        const { slug } = c.req.param();

        const blog = await Blog.findOne({
            slug,
            status: 'published'
        }).lean();

        if (!blog) {
            return c.json({
                success: false,
                error: 'Blog not found'
            }, 404);
        }

        return c.json({ success: true, data: blog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return c.json({ success: false, error: 'Failed to fetch blog' }, 500);
    }
};

/**
 * Get all unique categories (dynamically from published blogs)
 */
export const getCategories = async (c: Context) => {
    try {


        // Get count per category
        const categoriesWithCount = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return c.json({
            success: true,
            data: categoriesWithCount.map(cat => ({
                name: cat._id,
                count: cat.count
            }))
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
    }
};

/**
 * Get all unique tags (dynamically from published blogs)
 */
export const getTags = async (c: Context) => {
    try {
        const tags = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);

        return c.json({
            success: true,
            data: tags.map(tag => ({
                name: tag._id,
                count: tag.count
            }))
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return c.json({ success: false, error: 'Failed to fetch tags' }, 500);
    }
};

/**
 * Get related blogs by category (excluding current)
 */
export const getRelatedBlogs = async (c: Context) => {
    try {
        const { slug } = c.req.param();
        const limit = parseInt(c.req.query('limit') || '3', 10);

        const currentBlog = await Blog.findOne({ slug, status: 'published' }).select('category').lean();

        if (!currentBlog) {
            return c.json({ success: false, error: 'Blog not found' }, 404);
        }

        const relatedBlogs = await Blog.find({
            status: 'published',
            slug: { $ne: slug },
            category: currentBlog.category
        })
            .select('-content')
            .sort({ publishedAt: -1 })
            .limit(limit)
            .lean();

        return c.json({ success: true, data: relatedBlogs });
    } catch (error) {
        console.error('Error fetching related blogs:', error);
        return c.json({ success: false, error: 'Failed to fetch related blogs' }, 500);
    }
};
