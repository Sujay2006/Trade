import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  await connectDb();
  const { email, userName, googleId, profilePicture } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return Response.json({ success: false, message: "User already exists" });
  }

  const newUser = await User.create({
    email,
    userName,
    googleId,
    password: googleId,
    profilePicture
  });

  const token = jwt.sign(
    {
      id: newUser._id,
      email: newUser.email,
      userName: newUser.userName,
      role: newUser.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 7200
  });

  return Response.json({
    success: true,
    message: "Registered via Google",
    user: {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      userName: newUser.userName
    }
  });
}
