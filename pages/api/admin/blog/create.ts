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
   POST → Create Blog
========================= */

router.post(async (req, res) => {
  try {
    await connectDb();

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title or content missing",
      });
    }

    const parsedContent: BlogBlock[] = content;

    const finalContent: BlogBlock[] = [];

    for (const block of parsedContent) {
      if (block.type === "image" && block.value) {
        const uploaded = await cloudinary.uploader.upload(block.value, {
          folder: "blogs",
        });

        finalContent.push({
          type: "image",
          value: uploaded.secure_url,
        });
      } else {
        finalContent.push(block);
      }
    }

    const blog = await Blog.create({
      title,
      content: finalContent,
    });

    return res.status(201).json({
      success: true,
      blog,
    });

  } catch (error: unknown) {
    console.error("CREATE BLOG ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create blog";

    return res.status(500).json({
      success: false,
      message,
    });
  }
});

/* =========================
   Export
========================= */

export default router.handler();