import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

import fs from "fs";
import path from "path";

/* =========================
   Helpers
========================= */

function deleteFile(filePath?: string) {
  if (!filePath) return;

  const absolutePath = path.join(process.cwd(), "public", filePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

/* =========================
   Types
========================= */

// Extend request to support Multer files
interface ExtendedRequest extends NextApiRequest {
  files?: {
    image?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };
}

/* =========================
   Router
========================= */

const router = createRouter<ExtendedRequest, NextApiResponse>();

// Multer middleware (FILES ONLY)
router.use(async (req, res, next) => {
  const multerMiddleware = upload.fields([
   { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]);

  return new Promise((resolve, reject) => {
    // ✅ Use explicit types instead of 'typeof' to avoid circular reference
    // ✅ Cast through 'unknown' to avoid 'any'
    const middlewareFn = (multerMiddleware as unknown) as (
      request: ExtendedRequest,
      response: NextApiResponse,
      callback: (err?: Error | unknown) => void
    ) => void;

    middlewareFn(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(next());
    });
  });
});
// router.use(
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "banner", maxCount: 1 },
//   ])
// );

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
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch course";
    return res.status(500).json({ message });
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

    // Files from multer
    const imageFile = req.files?.image?.[0];
    const bannerFile = req.files?.banner?.[0];

    const updateData: Partial<{
      title: string;
      description: string;
      duration: string;
      timing: string;
      language: string;
      price: string;
      salePrice: string;
      whatsAppLink: string;
      telegramLink: string;
      modules: unknown[];
      image: string;
      banner: string;
    }> = {
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

    // Update modules only if provided
    if (typeof modules === "string") {
      updateData.modules = JSON.parse(modules);
    }

    // Update files only if uploaded
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
  } catch (err: unknown) {
    console.error("COURSE UPDATE ERROR:", err);
    const message =
      err instanceof Error ? err.message : "Failed to update course";
    return res.status(500).json({ message });
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

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    deleteFile(course.image);
    deleteFile(course.banner);

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course and images deleted successfully",
    });
  } catch (err: unknown) {
    console.error("COURSE DELETE ERROR:", err);
    const message =
      err instanceof Error ? err.message : "Failed to delete course";
    return res.status(500).json({ message });
  }
});

/* =========================
   Export
========================= */

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // 🔥 REQUIRED FOR MULTER
  },
};
