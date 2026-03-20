import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { adminSubscriptionsService } from "./admin.subscriptions.service";

export const adminSubscriptionsController = {
  async getSubscriptions(_req: Request, res: Response) {
    const subscriptions = await adminSubscriptionsService.getSubscriptions();
    return sendSuccess(res, "Subscriptions fetched successfully", { subscriptions });
  },

  async updateSubscriptionStatus(
    req: Request<
      { id: string },
      unknown,
      { status: "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED" | "EXPIRED" }
    >,
    res: Response,
  ) {
    try {
      const subscription = await adminSubscriptionsService.updateSubscriptionStatus(
        req.params.id,
        req.body.status
      );
      return sendSuccess(res, "Subscription status updated successfully", { subscription });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },
};