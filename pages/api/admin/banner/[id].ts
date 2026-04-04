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

    // Delete from Cloudinary
    if (banner.public_id) {
      await cloudinary.uploader.destroy(banner.public_id);
    }

    // Delete from DB
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

export default router.handler({
  onError: (err, _req, res) => {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";

    console.error(errorMessage);

    res.status(500).json({ message: errorMessage });
  },

  onNoMatch: (_req, res) => {
    res.status(405).json({ message: "Method Not Allowed" });
  },
});