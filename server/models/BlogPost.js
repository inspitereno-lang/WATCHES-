import mongoose from 'mongoose';

const blogSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    paragraphs: { type: [String], default: [] },
    bullets: { type: [String], default: [] },
  },
  { _id: false }
);

const blogPostSchema = new mongoose.Schema(
  {
    seedVersion: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    author: { type: String, default: 'T24 Editorial' },
    publishedAt: { type: Date, default: Date.now },
    readingMinutes: { type: Number, default: 6 },
    heroImage: { type: String, required: true },
    seoTitle: { type: String, required: true },
    seoDescription: { type: String, required: true },
    keywords: { type: [String], default: [] },
    sections: { type: [blogSectionSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
