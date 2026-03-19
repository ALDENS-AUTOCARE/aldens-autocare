import { Response } from "express";

export function sendSuccess(res: Response, message: string, data: unknown = {}, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message: string,
  errors: Array<{ field?: string; message: string }> = [],
  status = 400
) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}
