import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Banner from "@/models/Banner";

/* =========================
   Types
========================= */

interface ExtendedRequest extends NextApiRequest {
  files?: {
    banner?: Express.Multer.File[];
  };
}

/* =========================
   Router
========================= */

const router = createRouter<ExtendedRequest, NextApiResponse>();

/* =========================
   Multer Middleware
========================= */

router.use(async (req, res, next) => {
  const multerMiddleware = upload.fields([
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

/* =========================
   POST → Create Banner
========================= */

router.post(async (req, res) => {
  try {
    await connectDb();

    const bannerFile = req.files?.banner?.[0];

    const newBanner = await Banner.create({
      banner: bannerFile ? `/uploads/${bannerFile.filename}` : "",
    });

    return res.status(201).json({
      success: true,
      banner: newBanner,
    });
  } catch (error: unknown) {
    console.error("BANNER CREATE ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create banner";

    return res.status(500).json({
      success: false,
      message,
    });
  }
});

/* =========================
   GET → All Banners
========================= */

router.get(async (_req, res) => {
  try {
    await connectDb();

    const banners = await Banner.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch banners";

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
