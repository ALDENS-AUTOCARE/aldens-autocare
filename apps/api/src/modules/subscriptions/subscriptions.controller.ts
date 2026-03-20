import { Request, Response } from "express";
import { subscriptionsService } from "./subscriptions.service";
import { sendError, sendSuccess } from "../../utils/response";

export const subscriptionsController = {
  async initiate(req: Request, res: Response) {
    try {
      const result = await subscriptionsService.initiate(req.user!.id, req.body);
      return sendSuccess(res, "Subscription initiated successfully", result, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async getMine(_req: Request, res: Response) {
    const subscriptions = await subscriptionsService.findMine(_req.user!.id);
    return sendSuccess(res, "Subscriptions fetched successfully", { subscriptions });
  },

  async getActive(req: Request, res: Response) {
    const result = await subscriptionsService.findActive(req.user!.id);
    return sendSuccess(res, "Active subscription fetched successfully", result);
  },

  async cancel(req: Request<{ id: string }>, res: Response) {
    try {
      const subscription = await subscriptionsService.cancel(req.user!.id, req.params.id);
      return sendSuccess(res, "Subscription will cancel at end of billing period", {
        subscription,
      });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },
};
