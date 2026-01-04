import mongoose, { Schema, Document } from "mongoose";

export interface BlogBlock {
  type: "text" | "image";
  value: string;
}

export interface IBlog {
  _id?: string;
  title: string;
  content: BlogBlock[];
  likes: number;
  views: number;
  createdAt?: string;
}

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    content: [
      {
        type: { type: String },
        value: String,
      },
    ],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;