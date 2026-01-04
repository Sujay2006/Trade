import { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";
import { upload } from "@/lib/multer";
import { createRouter } from "next-connect";
import fs from "fs";
import path from "path";

// Define interface for the request
interface ExtendedRequest extends NextApiRequest {
  files: {
    images?: Express.Multer.File[];
  };
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

/**
 * GET: Fetch a single blog by ID
 */
router.get(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;
    const blog = await Blog.findById(id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json(blog);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE: Remove blog
 */
router.delete(async (req, res) => {
  try {
    console.log("detele");
    
    await connectDb();
    const { id } = req.query;

    // 1. Find the blog first to get the image paths
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // 2. Loop through content and delete files from the public folder
    if (blog.content && Array.isArray(blog.content)) {
      blog.content.forEach((block: any) => {
        if (block.type === "image" && typeof block.value === "string") {
          // Construct the absolute path to the file
          // block.value is usually "/uploads/filename.jpg"
          const filePath = path.join(process.cwd(), "public", block.value);

          // Check if file exists and delete it
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            } catch (err) {
              console.error(`Failed to delete file: ${filePath}`, err);
            }
          }
        }
      });
    }

    // 3. Delete the record from MongoDB
    await Blog.findByIdAndDelete(id);

    return res.status(200).json({ 
      success: true, 
      message: "Blog and associated images deleted successfully" 
    });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

/**
 * PUT: Update blog (handles text and new images)
 */
router.use(upload.fields([{ name: "images", maxCount: 20 }]));

router.put(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;
    const { title, content: contentStr } = req.body;
    const files = req.files || {};
    const imageFiles = files.images || [];

    const parsedContent = JSON.parse(contentStr);
    let newImageIndex = 0;

    // Logic: If block has a value (URL), keep it. If it's empty/placeholder, use new uploaded file.
    const updatedContent = parsedContent.map((block: any) => {
      if (block.type === "image") {
        if (block.value && typeof block.value === "string" && block.value.startsWith("/uploads")) {
          return block; // Keep existing image
        } else {
          // Replace placeholder with newly uploaded file
          const file = imageFiles[newImageIndex++];
          return { type: "image", value: `/uploads/${file?.filename}` };
        }
      }
      return block;
    });

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content: updatedContent },
      { new: true } // Return the modified document
    );

    return res.status(200).json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // Required for Multer
  },
};