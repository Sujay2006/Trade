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
  // If filePath already contains "public", adjust logic
  const absolutePath = path.join(process.cwd(), "public", filePath.replace(/^\/public/, ""));

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

// ✅ Use 'as any' here to bridge the gap between Express Middleware and Next-Connect
/* =========================
   Multer Middleware
========================= */

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

    deleteFile(banner.banner);
    await Banner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (err: unknown) {
    console.error("BANNER DELETE ERROR:", err);
    const message = err instanceof Error ? err.message : "Failed to delete banner";
    return res.status(500).json({ message });
  }
});

/* =========================
   Export
========================= */

export default router.handler({
  onError: (err, _req, res) => {
    // Narrow the 'err' type from 'unknown' to 'Error'
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error(errorMessage);
    res.status(500).json({ message: errorMessage });
  },
  onNoMatch: (_req, res) => {
    res.status(405).json({ message: "Method Not Allowed" });
  },
});

export const config = {
  api: {
    bodyParser: false, 
  },
};