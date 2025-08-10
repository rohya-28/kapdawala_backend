import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "store_jwt_secret";

interface DecodedToken {
  storeId?: string;
  sub?: string; // in case token uses `sub` instead
  role?: string;
}

export const verifyStoreToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Ensure role is 'store'
    if (decoded.role !== "store") {
      res.status(403).json({ error: "Forbidden: Invalid role" });
      return;
    }

    // Accept either storeId or sub
    req.storeId = decoded.storeId || decoded.sub;

    if (!req.storeId) {
      res.status(400).json({ error: "Invalid token payload" });
      return;
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
