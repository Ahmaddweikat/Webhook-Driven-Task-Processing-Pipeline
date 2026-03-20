import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  console.log("user from token:", req.user);
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
