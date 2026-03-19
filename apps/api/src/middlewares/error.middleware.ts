import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);
  return sendError(res, "Internal server error", [], 500);
}
