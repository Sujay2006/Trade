import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";

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

const router = createRouter<ExtendedRequest, NextApiResponse>();

/* =========================
   Multer Middleware
========================= */

router.use(
  upload.fields([
    { name: "images", maxCount: 20 }
  ])
);

/* =========================
   POST → Create Blog
========================= */

router.post(async (req, res) => {
  try {
    await connectDb();

    const { title, content: contentStr } = req.body;
    const imageFiles = req.files?.images ?? [];

    if (!title || !contentStr) {
      return res.status(400).json({
        success: false,
        message: "Title or content string missing",
      });
    }

    // 1️⃣ Parse JSON string
    const parsedContent: BlogBlock[] = JSON.parse(contentStr);

    // 2️⃣ Inject image paths
    let imageIndex = 0;
    const finalContent: BlogBlock[] = parsedContent.map((block) => {
      if (block.type === "image") {
        const file = imageFiles[imageIndex++];

        if (!file) {
          throw new Error("Image file missing for image block");
        }

        return {
          type: "image",
          value: `/uploads/${file.filename}`,
        };
      }

      return block;
    });

    // 3️⃣ Save to DB
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

export const config = {
  api: {
    bodyParser: false, // Required for Multer
  },
};
