import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDb();
  const { id } = req.query; // This is the paymentId/transaction unique ID

  /* ==========================================================
     1. REFUND LOGIC (Mark as Refunded, keep record)
  ========================================================== */
  if (req.method === "POST") {
    try {
      const { paymentId, amount, courseId } = req.body;

      // 1. Initiate Razorpay Refund
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount * 100, // Amount in paise
        speed: "normal",
      });

      // 2. Update status in Course Model to 'refunded'
      await Course.findOneAndUpdate(
        { _id: courseId, "students.paymentId": paymentId },
        { 
          $set: { "students.$.status": "refunded" },
          $inc: { totalRevenue: -Number(amount) } 
        }
      );

      return res.status(200).json({ success: true, refund });
    } catch (error: any) {
      console.error("Refund Error:", error);
      return res.status(500).json({ message: error.description || "Refund failed" });
    }
  }

  /* ==========================================================
     2. DELETE LOGIC (Remove record completely)
  ========================================================== */
  if (req.method === "DELETE") {
    try {
      // For DELETE, we get data from query params sent from frontend
      const { courseId, amount } = req.query;

      if (!courseId || !id) {
        return res.status(400).json({ message: "Missing Course ID or Payment ID" });
      }

      // 1. Remove student from the array and decrease revenue
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          $pull: { students: { paymentId: id } }, // id here is the paymentId from req.query
          $inc: { totalRevenue: -Number(amount) }
        },
        { new: true }
      );

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({ success: true, message: "Transaction deleted successfully" });
    } catch (error: any) {
      console.error("Delete Error:", error);
      return res.status(500).json({ message: error.message || "Delete failed" });
    }
  }

  // Handle other methods
  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}