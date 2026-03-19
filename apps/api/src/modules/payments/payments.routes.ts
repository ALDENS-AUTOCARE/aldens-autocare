import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { initiateBookingPaymentSchema } from "./payments.schema";
import {
  paymentsController,
} from "./payments.controller";

const router = Router();

router.post(
  "/initiate-booking-payment",
  requireAuth,
  validate(initiateBookingPaymentSchema),
  paymentsController.initiateBookingPayment
);

router.post("/paystack/webhook", paymentsController.paystackWebhook);

export default router;

