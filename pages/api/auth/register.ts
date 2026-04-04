import type { NextApiRequest, NextApiResponse } from "next";
import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie"; // Recommended for cleaner cookie handling

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDb();

    const { email, userName, phone, password } = req.body;

    // 2. Validate Input
    if (!email || !userName || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields (Name, Email, Phone, Password) are required" });
    }

    // 3. Check if User already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists with this email" });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create New User
    const newUser = await User.create({
      email,
      userName,
      phone,
      password: hashedPassword,
      role: "user", // Default role
    });

    // 6. Generate JWT Token (Same as Login)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

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

    // 7. Set Cookie Header (Same as Login)
    // Using 'serialize' ensures the cookie is formatted correctly
    const cookieHeader = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7200, // 2 hours
      path: "/",
    });

    res.setHeader("Set-Cookie", cookieHeader);

    // 8. Return Success
    return res.status(201).json({
      success: true,
      message: "User registered and logged in successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        userName: newUser.userName,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}