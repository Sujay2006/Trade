import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Banner from "@/models/Banner";

interface ExtendedRequest extends NextApiRequest {
  files: {
    banner?: Express.Multer.File[];
  };
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

router.use(
  upload.fields([
    { name: "banner", maxCount: 1 },
  ])
);

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
  } catch (error: any) {
    console.error("BANNER CREATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


router.get(async (req, res) => {
  try {
    await connectDb();
    const banners = await Banner.find().sort({ createdAt: -1 });
    return res.status(200).json({
        success: true,
        banners,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});



export default router.handler();

export const config = {
  api: {
    bodyParser: false,
  },
};
