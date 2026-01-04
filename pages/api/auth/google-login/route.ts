import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  await connectDb();
  const { email, googleId } = await req.json();

  const user = await User.findOne({ email });
  if (!user || user.googleId !== googleId) {
    return Response.json({
      success: false,
      message: "Google login failed"
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role
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
    message: "Logged in via Google",
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      userName: user.userName
    }
  });
}
