import { NextFunction, Request, Response } from "express";
import { enforcementService } from "./enforcement.service";
import { sendError } from "../../utils/response";

export async function requireActivePlan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return sendError(res, "Authentication required", [], 401);
  }

  try {
    const subscription = await enforcementService.getActiveSubscriptionForUser(req.user.id);
    if (!subscription) {
      return sendError(res, "An active membership plan is required", [], 403);
    }
    next();
  } catch {
    return sendError(res, "Failed to verify plan status", [], 500);
  }
}
