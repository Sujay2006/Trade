import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

/* =========================
   Types
========================= */

// Extend request to include Multer files
interface ExtendedRequest extends NextApiRequest {
  files?: {
    image?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

/* =========================
   Multer Middleware
========================= */

router.use(
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ])
);

/* =========================
   POST → Create Course
========================= */

router.post(async (req, res) => {
  try {
    await connectDb();

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

    const imageFile = req.files?.image?.[0];
    const bannerFile = req.files?.banner?.[0];

    const parsedModules =
      typeof modules === "string" ? JSON.parse(modules) : [];

    const newCourse = await Course.create({
      title,
      description,
      duration,
      timing,
      language,
      price,
      salePrice,
      whatsAppLink,
      telegramLink,
      modules: parsedModules,
      image: imageFile ? `/uploads/${imageFile.filename}` : "",
      banner: bannerFile ? `/uploads/${bannerFile.filename}` : "",
    });

    return res.status(201).json({
      success: true,
      course: newCourse,
    });
  } catch (error: unknown) {
    console.error("COURSE CREATE ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create course";

    return res.status(500).json({
      success: false,
      message,
    });
  }
});

/* =========================
   GET → All Courses
========================= */

router.get(async (_req, res) => {
  try {
    await connectDb();
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json(courses);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch courses";

    return res.status(500).json({ message });
  }
});

/* =========================
   Export
========================= */

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // 🔥 REQUIRED for Multer
  },
};
