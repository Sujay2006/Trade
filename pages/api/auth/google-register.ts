import type { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();
    const { email, userName, googleId, profilePicture } = req.body;

    // 2. Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 3. Create User
    const newUser = await User.create({
      email,
      userName,
      googleId,
      password: googleId, // Note: Consider hashing if ever used for standard login
      profilePicture,
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing from env");

    // 4. Generate Token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        userName: newUser.userName,
        role: newUser.role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // 5. Set Cookie Header
    const cookieHeader = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7200,
      path: "/",
    });

    res.setHeader("Set-Cookie", cookieHeader);

    return res.status(201).json({
      success: true,
      message: "Registered via Google",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        userName: newUser.userName,
      },
    });
  } catch (error: unknown) {
    console.error("REGISTER_ERROR:", error);
    const msg = error instanceof Error ? error.message : "Internal Error";
    return res.status(500).json({ success: false, message: msg });
  }
}