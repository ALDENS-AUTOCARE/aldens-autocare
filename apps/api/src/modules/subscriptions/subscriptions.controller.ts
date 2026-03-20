import { Request, Response } from "express";
import { subscriptionsService } from "./subscriptions.service";
import { sendError, sendSuccess } from "../../utils/response";

export const subscriptionsController = {
  async getMe(req: Request, res: Response) {
    const subscription = await subscriptionsService.getMe(req.user!.id);
    return sendSuccess(res, "Subscription fetched successfully", { subscription });
  },

  async getUsage(req: Request, res: Response) {
    const usage = await subscriptionsService.getUsage(req.user!.id);
    return sendSuccess(res, "Subscription usage fetched successfully", usage);
  },

  async getCapabilities(req: Request, res: Response) {
    const capabilities = await subscriptionsService.getCapabilities(req.user!.id);
    return sendSuccess(res, "Subscription capabilities fetched successfully", { capabilities });
  },

  async checkout(req: Request, res: Response) {
    try {
      const result = await subscriptionsService.checkout(req.user!.id, req.body);
      return sendSuccess(res, "Subscription checkout initialized successfully", result, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const subscription = await subscriptionsService.cancel(
        req.user!.id,
        req.body.cancelAtPeriodEnd
      );
      return sendSuccess(res, "Subscription cancellation updated successfully", {
        subscription,
      });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async upgrade(req: Request, res: Response) {
    try {
      const result = await subscriptionsService.upgrade(req.user!.id, req.body);
      return sendSuccess(res, "Subscription upgrade initialized successfully", result, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },
};
