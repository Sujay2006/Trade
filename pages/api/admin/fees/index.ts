import { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import Course from "@/models/Course";
import User from "@/models/User"; // Import is mandatory for populate

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDb();

    const courses = await Course.find()
      .populate({
        path: "students.user",
        model: User,
        select: "userName email phone"
      });

    let totalFees = 0;
    let monthlyFees = 0;
    let allTransactions: any[] = [];
    const currentMonth = new Date().getMonth();

    courses.forEach((course) => {
      course.students.forEach((entry: any) => {
        const amount = Number(entry.amount) || 0;
        const isPaid = entry.status === "paid";
        
        if (isPaid) {
          totalFees += amount;
          if (entry.createdAt && new Date(entry.createdAt).getMonth() === currentMonth) {
            monthlyFees += amount;
          }
        }

        allTransactions.push({
          id: entry.paymentId, 
          studentName: entry.user?.userName || "Unknown Student",
          studentPhone: entry.user?.phone || entry.phone || "N/A",
          studentEmail: entry.user?.email || "N/A",
          courseTitle: course.title,
          courseId: course._id,
          amount: amount,
          status: entry.status,
          date: entry.createdAt,
        });
      });
    });

    res.status(200).json({
      totalFees,
      monthlyFees,
      transactions: allTransactions.reverse(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}