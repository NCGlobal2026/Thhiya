import { api } from './api';

/**
 * Blog API Types
 */
export interface Blog {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    contentFormat: 'html' | 'markdown';
    category: string;
    tags: string[];
    author: string;
    featuredImage?: string;
    readTime: string;
    status: 'draft' | 'published' | 'archived';
    publishedAt: string;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface BlogListItem extends Omit<Blog, 'content'> { }

export interface BlogCategory {
    name: string;
    count: number;
}

export interface BlogTag {
    name: string;
    count: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface BlogsResponse {
    success: boolean;
    data: BlogListItem[];
    pagination: PaginationInfo;
}

export interface BlogResponse {
    success: boolean;
    data: Blog;
}

export interface CategoriesResponse {
    success: boolean;
    data: BlogCategory[];
}

export interface TagsResponse {
    success: boolean;
    data: BlogTag[];
}

/**
 * Blog Service
 */
export const blogService = {
    /**
     * Get paginated list of blogs
     */
    getBlogs: async (options?: {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        search?: string;
    }): Promise<BlogsResponse> => {
        const params = new URLSearchParams();
        if (options?.page) params.append('page', options.page.toString());
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.category) params.append('category', options.category);
        if (options?.tag) params.append('tag', options.tag);
        if (options?.search) params.append('search', options.search);

        const queryString = params.toString();
        const url = queryString ? `/blogs?${queryString}` : '/blogs';

        const response = await api.get<BlogsResponse>(url);
        return response.data;
    },

    /**
     * Get single blog by slug
     */
    getBlogBySlug: async (slug: string): Promise<Blog> => {
        const response = await api.get<BlogResponse>(`/blogs/${slug}`);
        if (!response.data.success) {
            throw new Error('Blog not found');
        }
        return response.data.data;
    },

    /**
     * Get all categories with counts
     */
    getCategories: async (): Promise<BlogCategory[]> => {
        const response = await api.get<CategoriesResponse>('/blogs/categories');
        return response.data.data;
    },

    /**
     * Get all tags with counts
     */
    getTags: async (): Promise<BlogTag[]> => {
        const response = await api.get<TagsResponse>('/blogs/tags');
        return response.data.data;
    },

    /**
     * Get related blogs for a given blog
     */
    getRelatedBlogs: async (slug: string, limit = 3): Promise<BlogListItem[]> => {
        const response = await api.get<{ success: boolean; data: BlogListItem[] }>(
            `/blogs/${slug}/related?limit=${limit}`
        );
        return response.data.data;
    }
};

export default blogService;
