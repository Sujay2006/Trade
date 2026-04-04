import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";
import User from "@/models/User"; // Ensure User model is imported for population to work

const router = createRouter<NextApiRequest, NextApiResponse>();

/* =========================
   GET → Fetch course by ID (with Student Details)
========================= */
router.get(async (req, res) => {
  try {
    await connectDb();

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // .populate replaces the User IDs in the students array with actual User objects
    const course = await Course.findById(id).populate({
      path: "students.user",
      model: User,
      select: "userName email phone", // Only fetch these specific fields from User model
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return the course directly to match your Redux state expectation
    return res.status(200).json(course);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch course";
    console.error("GET Course Error:", message);
    return res.status(500).json({ message });
  }
});

/* =========================
   PUT → Update course
========================= */
router.put(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const updateData = req.body;

    // Use { new: true } to return the updated document
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: "students.user",
      model: User,
      select: "userName email phone",
    });

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(updatedCourse);

  } catch (error: unknown) {
    console.error("PUT Course Error:", error);
    return res.status(500).json({ message: "Failed to update course" });
  }
});

/* =========================
   DELETE → Remove course
========================= */
router.delete(async (req, res) => {
  try {
    await connectDb();
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ success: true, id });
  } catch (error: unknown) {
    console.error("DELETE Course Error:", error);
    return res.status(500).json({ message: "Failed to delete course" });
  }
});

export default router.handler({
  onError: (err: any, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  },
});