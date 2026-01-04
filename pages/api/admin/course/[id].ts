import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

import fs from "fs";
import path from "path";

function deleteFile(filePath?: string) {
  if (!filePath) return;

  const absolutePath = path.join(process.cwd(), "public", filePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}


// Extend request to support multer files
interface ExtendedRequest extends NextApiRequest {
  files: {
    image?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

// ✅ Multer middleware (FILES ONLY)
router.use(
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ])
);

/* =========================
   GET /api/admin/course/:id
========================= */
router.get(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(course);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

/* =========================
   PUT /api/admin/course/:id
========================= */
router.put(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const {
      title,
      description,
      duration,
      timing,
      language,
      price,
      salePrice,
      whatsAppLink,
      telegramLink,
      modules,
    } = req.body;

    // 👇 Files from multer
    const imageFile = req.files?.image?.[0];
    const bannerFile = req.files?.banner?.[0];

    const updateData: any = {
      title,
      description,
      duration,
      timing,
      language,
      price,
      salePrice,
      whatsAppLink,
      telegramLink,
    };

    // Only update modules if provided
    if (modules) {
      updateData.modules = JSON.parse(modules);
    }

    // 🔥 Only update image if new file uploaded
    if (imageFile) {
      updateData.image = `/uploads/${imageFile.filename}`;
    }

    if (bannerFile) {
      updateData.banner = `/uploads/${bannerFile.filename}`;
    }

    const updated = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      course: updated,
    });
  } catch (err: any) {
    console.error("COURSE UPDATE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE /api/admin/course/:id
========================= */
router.delete(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    // 1️⃣ Find course first
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2️⃣ Delete files from disk
    deleteFile(course.image);
    deleteFile(course.banner);

    // 3️⃣ Delete course from DB
    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course and images deleted successfully",
    });
  } catch (err: any) {
    console.error("COURSE DELETE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});


export default router.handler();

export const config = {
  api: {
    bodyParser: false, // 🔥 REQUIRED FOR MULTER
  },
};
