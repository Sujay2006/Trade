import type { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();
    const { email, userName, googleId, profilePicture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: "Invalid Google Data" });
    }

    // 1. Find the user by email
    let user = await User.findOne({ email });

    // 2. If user doesn't exist, CREATE them (Register)
    if (!user) {
      user = await User.create({
        email,
        userName,
        googleId,
        password: googleId, // Use googleId as a dummy password for OAuth users
        profilePicture,
        role: "user",
      });
    }

    // 3. Optional: Update googleId if they originally registered with email/password
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing");

    // 4. Generate Token (Works for both New and Existing users)
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

    // 5. Set Cookie Header
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Better for OAuth redirects than 'strict'
        maxAge: 7200,
        path: "/",
      })
    );

    // 6. Return Success (Frontend will redirect to /)
    return res.status(200).json({
      success: true,
      message: "Authenticated via Google",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: unknown) {
    console.error("GOOGLE_AUTH_ERROR:", error);
    const msg = error instanceof Error ? error.message : "Internal Error";
    return res.status(500).json({ success: false, message: msg });
  }
}