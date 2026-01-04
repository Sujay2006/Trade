import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { upload } from "@/lib/multer";
import { connectDb } from "@/lib/connectDb";
import Banner from "@/models/Banner";
import fs from "fs";
import path from "path";

/* =========================
   Types
========================= */

interface ExtendedRequest extends NextApiRequest {
  files?: {
    banner?: Express.Multer.File[];
  };
}

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
   Router
========================= */

const router = createRouter<ExtendedRequest, NextApiResponse>();

/* =========================
   Multer Middleware
========================= */

router.use(
  upload.fields([
    { name: "banner", maxCount: 1 },
  ])
);

/* =========================
   DELETE → Remove banner
========================= */

router.delete(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid banner id" });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Delete file from disk
    deleteFile(banner.banner);

    // Delete banner from DB
    await Banner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (err: unknown) {
    console.error("BANNER DELETE ERROR:", err);

    const message =
      err instanceof Error ? err.message : "Failed to delete banner";

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
