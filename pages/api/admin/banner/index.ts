import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { connectDb } from "@/lib/connectDb";
import Banner from "@/models/Banner";
import cloudinary from "@/lib/cloudinary";

/* =========================
   Router
========================= */

const router = createRouter<NextApiRequest, NextApiResponse>();

/* =========================
   POST → Upload Banner
========================= */

router.post(async (req, res) => {
  try {
    await connectDb();

    const { banner } = req.body;

    if (!banner) {
      return res.status(400).json({
        success: false,
        message: "Banner image required",
      });
    }

    const uploaded = await cloudinary.uploader.upload(banner, {
      folder: "banners",
    });

    const newBanner = await Banner.create({
      banner: uploaded.secure_url,
    });

    return res.status(201).json({
      success: true,
      banner: newBanner,
    });

  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Upload failed";

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
      error instanceof Error ? error.message : "Failed";

    return res.status(500).json({ message });
  }
});

export default router.handler();