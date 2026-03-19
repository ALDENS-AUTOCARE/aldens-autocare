import { Request, Response } from "express";
import { paymentsService } from "./payments.service";
import { sendError, sendSuccess } from "../../utils/response";

export const paymentsController = {
  async initiateBookingPayment(req: Request, res: Response) {
    try {
      const result = await paymentsService.initiateBookingPayment(req.user!.id, req.body);
      return sendSuccess(res, "Payment initialized successfully", result, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async paystackWebhook(req: Request, res: Response) {
    try {
      await paymentsService.handlePaystackWebhook(req.body);
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Paystack webhook error:", error);
      return res.status(200).json({ received: true });
    }
  },
};

