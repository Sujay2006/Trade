import type { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { serialize } from "cookie"; // You may need to run: npm install cookie

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();
    const { email, googleId } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.googleId !== googleId) {
      return res.status(401).json({
        success: false,
        message: "Google login failed",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing");

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Set cookie using Header (Standard for Pages Router)
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7200,
        path: "/",
      })
    );

    return res.status(200).json({
      success: true,
      message: "Logged in via Google",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Error";
    return res.status(500).json({ success: false, message: msg });
  }
}