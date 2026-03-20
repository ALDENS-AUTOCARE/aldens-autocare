import { Request, Response } from "express";
import { subscriptionsService } from "./subscriptions.service";
import { sendError, sendSuccess } from "../../utils/response";

type SubscriptionCheckoutBody = {
  planCode: "SIGNATURE" | "EXECUTIVE" | "FLEETCARE";
  billingCycle: "MONTHLY" | "YEARLY";
  provider: "PAYSTACK" | "MTN_MOMO";
};

type CancelSubscriptionBody = {
  cancelAtPeriodEnd: boolean;
};

export const subscriptionsController = {
  async checkout(req: Request<Record<string, never>, unknown, SubscriptionCheckoutBody>, res: Response) {
    try {
      const result = await subscriptionsService.initiate(req.user!.id, req.body);
      return sendSuccess(
        res,
        "Subscription checkout initialized successfully",
        {
          subscription: result.subscription,
          checkoutUrl: result.checkoutUrl,
          reference: result.reference,
        },
        201,
      );
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async getMe(req: Request, res: Response) {
    const subscription = await subscriptionsService.findCurrent(req.user!.id);
    return sendSuccess(res, "Subscription fetched successfully", { subscription });
  },

  async getUsage(req: Request, res: Response) {
    const usage = await subscriptionsService.findUsage(req.user!.id);
    return sendSuccess(res, "Subscription usage fetched successfully", usage);
  },

  async getCapabilities(req: Request, res: Response) {
    const capabilities = await subscriptionsService.findCapabilities(req.user!.id);
    return sendSuccess(res, "Subscription capabilities fetched successfully", { capabilities });
  },

  async getMine(_req: Request, res: Response) {
    const subscriptions = await subscriptionsService.findMine(_req.user!.id);
    return sendSuccess(res, "Subscriptions fetched successfully", { subscriptions });
  },

  async getActive(req: Request, res: Response) {
    const result = await subscriptionsService.findActive(req.user!.id);
    return sendSuccess(res, "Active subscription fetched successfully", result);
  },

  async upgrade(req: Request<Record<string, never>, unknown, SubscriptionCheckoutBody>, res: Response) {
    try {
      const result = await subscriptionsService.upgrade(req.user!.id, req.body);
      return sendSuccess(
        res,
        "Subscription upgrade initialized successfully",
        {
          subscription: result.subscription,
          checkoutUrl: result.checkoutUrl,
          reference: result.reference,
        },
        201,
      );
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async cancel(req: Request<Record<string, never>, unknown, CancelSubscriptionBody>, res: Response) {
    try {
      const subscription = await subscriptionsService.cancelCurrent(
        req.user!.id,
        req.body.cancelAtPeriodEnd,
      );
      return sendSuccess(res, "Subscription cancellation updated successfully", {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          renewalDate: subscription.renewalDate,
        },
      });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async cancelById(req: Request<{ id: string }, unknown, CancelSubscriptionBody>, res: Response) {
    try {
      const subscription = await subscriptionsService.cancel(req.user!.id, req.params.id, req.body.cancelAtPeriodEnd);
      return sendSuccess(res, "Subscription cancellation updated successfully", {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          renewalDate: subscription.renewalDate,
        },
      });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },
};
