import type { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(course);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch course" });
  }
}
