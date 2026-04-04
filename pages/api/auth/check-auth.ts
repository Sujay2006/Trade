// lib/checkAuth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: string;
  email: string;
  userName: string;
  role: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedUser;
}

export const checkAuth = (
  req: AuthenticatedRequest,
  res: NextApiResponse
): boolean => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
      return false;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as DecodedUser;

    req.user = decoded;

    return true;
  } catch (error) {
    console.error("Auth error:", error);

    res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });

    return false;
  }
};