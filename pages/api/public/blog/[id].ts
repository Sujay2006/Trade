import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";

/* =========================
   Types
========================= */

interface ExtendedRequest extends NextApiRequest {}

/* =========================
   Router
========================= */

const router = createRouter<ExtendedRequest, NextApiResponse>();

/* =========================
   GET → Fetch blog by ID + increment views
========================= */

router.get(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // 👈 increment views
      { new: true }
    );

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
   PATCH → Like blog
========================= */

router.patch(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json({ likes: blog.likes });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to like blog";
    return res.status(500).json({ message });
  }
});

export default router.handler();
