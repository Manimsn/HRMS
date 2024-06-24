// utils/jwt.ts

import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

export const generateAccessToken = (user: any) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
};

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (e: any) {
    // console.error("Token verification error:", e);
    // return null;
    // Check specific error types
    if (e.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else {
      throw new Error("Invalid token");
    }
  }
};

export const fetchUserRole = (): string | null => {
  return Cookies.get("userRole") || null;
};
