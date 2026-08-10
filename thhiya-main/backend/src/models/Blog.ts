import mongoose, { Schema, Document } from 'mongoose';

/**
 * Blog Post Schema
 * 
 * Designed for future admin editor integration with rich text (HTML/Markdown).
 * Categories are stored as strings - dynamically aggregated from existing posts.
 */

export interface IBlog extends Document {
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
    publishedAt: Date;
    seo: {
        metaTitle?: string;
        metaDescription?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    excerpt: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    content: {
        type: String,
        required: true
    },
    contentFormat: {
        type: String,
        enum: ['html', 'markdown'],
        default: 'html'
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    author: {
        type: String,
        required: true,
        default: 'Thhiya Insights Team'
    },
    featuredImage: {
        type: String,
        trim: true
    },
    readTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    publishedAt: {
        type: Date,
        index: true
    },
    seo: {
        metaTitle: { type: String, maxlength: 70 },
        metaDescription: { type: String, maxlength: 160 }
    }
}, {
    timestamps: true
});

// Compound indexes for common queries
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, status: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1, status: 1 });

// Text search index for future search functionality
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export default mongoose.model<IBlog>('Blog', BlogSchema);
