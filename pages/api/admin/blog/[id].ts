import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";
import fs from "fs";
import path from "path";

/* =========================
   Types
========================= */

type BlogBlock =
  | { type: "text"; value: string }
  | { type: "image"; value?: string };

interface ExtendedRequest extends NextApiRequest {
  files?: {
    images?: Express.Multer.File[];
  };
}

/* =========================
   Router
========================= */

const router = createRouter<ExtendedRequest, NextApiResponse>();

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
    const message =
      error instanceof Error ? error.message : "Failed to fetch blog";
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
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete associated image files
    if (Array.isArray(blog.content)) {
      blog.content.forEach((block: BlogBlock) => {
        if (block.type === "image" && typeof block.value === "string") {
          const filePath = path.join(process.cwd(), "public", block.value);

          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error("Failed to delete file:", filePath, err);
            }
          }
        }
      });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Blog and associated images deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete blog";
    return res.status(500).json({ message });
  }
});

/* =========================
   PUT → Update blog
========================= */

// Multer middleware
router.use(upload.fields([{ name: "images", maxCount: 20 }]));

router.put(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const { title, content: contentStr } = req.body;
    const imageFiles = req.files?.images ?? [];

    const parsedContent: BlogBlock[] = JSON.parse(contentStr);
    let newImageIndex = 0;

    const updatedContent: BlogBlock[] = parsedContent.map((block) => {
      if (block.type === "image") {
        if (
          typeof block.value === "string" &&
          block.value.startsWith("/uploads")
        ) {
          return block; // keep existing image
        }

        const file = imageFiles[newImageIndex++];
        if (!file) {
          throw new Error("Missing image file for blog block");
        }

        return {
          type: "image",
          value: `/uploads/${file.filename}`,
        };
      }

      return block;
    });

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content: updatedContent },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      blog: updatedBlog,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update blog";
    return res.status(500).json({ message });
  }
});

/* =========================
   Export
========================= */

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // Required for Multer
  },
};
