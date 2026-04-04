import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  try {
    await connectDb();
    const { amount, courseId } = req.body;

    // 1. Validation
    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // 2. Check Seat Availability
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Convert seat to number to ensure safe comparison
    const availableSeats = Number(course.seat);

    if (isNaN(availableSeats) || availableSeats <= 0) {
      return res.status(400).json({ 
        error: "Registration Closed", 
        message: "Sorry, all seats for this course are currently full." 
      });
    }

    // 3. Create Razorpay Order
    // Razorpay expects amount in paise (integers only)
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), 
      currency: "INR",
      notes: {
        courseId: courseId, // Optional: helpful for tracking in Razorpay Dashboard
      }
    });

    res.status(200).json(order);
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
}