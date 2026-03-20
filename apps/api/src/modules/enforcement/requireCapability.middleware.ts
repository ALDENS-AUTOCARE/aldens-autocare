import { NextFunction, Request, Response } from "express";
import { enforcementService } from "./enforcement.service";
import { sendError } from "../../utils/response";
import type { PlanCapabilities } from "../plans/plans.types";

export function requireCapability(capability: keyof PlanCapabilities) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", [], 401);
    }

    try {
      const subscription = await enforcementService.getActiveSubscriptionForUser(req.user.id);
      if (!subscription) {
        return sendError(res, "An active membership plan is required", [], 403);
      }

      const caps = enforcementService.getCapabilitiesFromSubscription(subscription);
      const value = caps[capability];

      if (!value || value === 0) {
        return sendError(
          res,
          "Your current membership plan does not include this feature",
          [],
          403,
        );
      }

      next();
    } catch {
      return sendError(res, "Failed to verify plan capabilities", [], 500);
    }
  };
}
