import type { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import Blog from "@/models/Blog";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    await connectDb();

    // Sort by latest created
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    return res.status(200).json(blogs);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return res.status(500).json({ message });
  }
}
