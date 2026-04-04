import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDb();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      courseId, 
      userId, 
      amount, 
      phone 
    } = req.body;

    // 1. Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Verification failed" });
    }

    // Convert string ID to MongoDB ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 2. Update Course: Add student and update revenue
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        students: {
          user: userObjectId, 
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: Number(amount),
          status: "paid",
        },
      },
      $inc: { totalRevenue: Number(amount) },
    });

    // 3. Update User: Save phone and add course to enrollment
    // We update the 'name' field if your DB uses 'name' but Redux uses 'userName'
    await User.findByIdAndUpdate(userId, {
      $set: { phone: phone },
      $addToSet: { enrolledCourses: courseId }
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Verify Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}