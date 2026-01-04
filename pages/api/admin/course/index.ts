import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

// Extend request to include files
interface ExtendedRequest extends NextApiRequest {
  files: {
    image?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

// ✅ Multer middleware (ONLY file fields)
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
    console.log("res.body",req.body);
    
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

    console.log(imageFile, req.files);
    

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
      modules: JSON.parse(modules || "[]"), // modules comes as string
      image: imageFile ? `/uploads/${imageFile.filename}` : "",
      banner: bannerFile ? `/uploads/${bannerFile.filename}` : "",
    });

    return res.status(201).json({
      success: true,
      course: newCourse,
    });
  } catch (error: any) {
    console.error("COURSE CREATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   GET → All Courses
========================= */
router.get(async (req, res) => {
  try {
    await connectDb();
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json(courses);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false, // 🔥 REQUIRED for Multer
  },
};
