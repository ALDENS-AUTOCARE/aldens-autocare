import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, "Authentication required", [], 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return sendError(res, "Invalid or expired token", [], 401);
  }
}
