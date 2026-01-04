import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";

// We define a custom interface to help TypeScript understand Multer's files
interface ExtendedRequest extends NextApiRequest {
  files: {
    images?: Express.Multer.File[];
  };
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

// ✅ ONLY declare actual file fields. Text fields like 'title' and 'content' 
// will be handled by Multer and placed into req.body automatically.
router.use(
  upload.fields([
    { name: "images", maxCount: 20 }
  ])
);

router.post(async (req, res) => {
  try {
    await connectDb();

    const { title, content: contentStr } = req.body;
    const files = req.files || {};
    const imageFiles = files.images || [];

    console.log("REQ.BODY:", req.body);
    console.log("FILES RECEIVED:", imageFiles.length);

    if (!title || !contentStr) {
      return res.status(400).json({
        success: false,
        message: "Title or content string missing",
      });
    }

    // 1. Parse the JSON string sent from frontend
    const parsedContent = JSON.parse(contentStr);
    
    // 2. Map through blocks and inject the saved file paths
    let imageIndex = 0;
    const finalContent = parsedContent.map((block: any) => {
      if (block.type === "image") {
        const file = imageFiles[imageIndex++];
        if (!file) {
          throw new Error("Image file missing for image block");
        }
        // Save the path that will be accessible via the browser
        return {
          type: "image",
          value: `/uploads/${file.filename}`, 
        };
      }
      return block;
    });

    // 3. Save to MongoDB
    const blog = await Blog.create({
      title,
      content: finalContent,
    });

    return res.status(201).json({
      success: true,
      blog,
    });
  } catch (error: any) {
    console.error("CREATE BLOG ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js body parser so Multer can work
  },
};