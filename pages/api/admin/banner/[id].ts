import { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import Banner from "@/models/Banner";
import { upload } from "@/lib/multer";
import { createRouter } from "next-connect";
import fs from "fs";
import path from "path";

// Define interface for the request
interface ExtendedRequest extends NextApiRequest {
  files: {
    banner?: Express.Multer.File[];
  };
}

function deleteFile(filePath?: string) {
  if (!filePath) return;

  const absolutePath = path.join(process.cwd(), "public", filePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

const router = createRouter<ExtendedRequest, NextApiResponse>();

router.use(
  upload.fields([
    { name: "banner", maxCount: 1 },
  ])
);


router.delete(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // 2️⃣ Delete files from disk
    deleteFile(banner.banner);

    // 3️⃣ Delete course from DB
    await Banner.findByIdAndDelete(id);

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
    bodyParser: false, // Required for Multer
  },
};