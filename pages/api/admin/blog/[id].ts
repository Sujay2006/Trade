import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";
import cloudinary from "@/lib/cloudinary";

/* =========================
   Types
========================= */
type BlogBlock =
  | { type: "text"; value: string }
  | { type: "image"; value?: string };

const router = createRouter<NextApiRequest, NextApiResponse>();

/* =========================
   GET → Fetch blog by ID
========================= */
router.get(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json(blog);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch blog";
    return res.status(500).json({ message });
  }
});

/* =========================
   DELETE → Remove blog
========================= */
router.delete(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (Array.isArray(blog.content)) {
      for (const block of blog.content as BlogBlock[]) {
        if (block.type === "image" && block.value?.includes("cloudinary")) {
          try {
            const publicId = block.value.split("/").slice(-2).join("/").split(".")[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Cloudinary delete error:", err);
          }
        }
      }
    }

    await Blog.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (error: unknown) {
    return res.status(500).json({ message: "Failed to delete" });
  }
});

/* =========================
   PUT → Update blog
========================= */
router.put(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;
    const { title, content } = req.body;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Ensure content is iterable
    const parsedContent: BlogBlock[] = Array.isArray(content) ? content : [];
    const updatedContent: BlogBlock[] = [];

    for (const block of parsedContent) {
      if (block.type === "image" && block.value) {
        // If it's already a Cloudinary URL, keep it
        if (block.value.startsWith("http")) {
          updatedContent.push(block);
        } else {
          // If it's Base64 (new upload), send to Cloudinary
          const uploaded = await cloudinary.uploader.upload(block.value, {
            folder: "blogs",
          });
          updatedContent.push({
            type: "image",
            value: uploaded.secure_url,
          });
        }
      } else {
        updatedContent.push(block);
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content: updatedContent },
      { new: true }
    );

    return res.status(200).json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router.handler();