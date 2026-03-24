import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
