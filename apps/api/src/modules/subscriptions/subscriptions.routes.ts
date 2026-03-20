import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  cancelSubscriptionByIdSchema,
  cancelSubscriptionSchema,
  subscriptionCheckoutSchema,
  subscriptionReadSchema,
  upgradeSubscriptionSchema,
} from "./subscriptions.schema";
import { subscriptionsController } from "./subscriptions.controller";

const router = Router();

router.post(
  "/checkout",
  requireAuth,
  validate(subscriptionCheckoutSchema),
  subscriptionsController.checkout,
);

router.post(
  "/initiate",
  requireAuth,
  validate(subscriptionCheckoutSchema),
  subscriptionsController.checkout,
);

router.get("/me", requireAuth, validate(subscriptionReadSchema), subscriptionsController.getMe);

router.get("/usage", requireAuth, validate(subscriptionReadSchema), subscriptionsController.getUsage);

router.get(
  "/capabilities",
  requireAuth,
  validate(subscriptionReadSchema),
  subscriptionsController.getCapabilities,
);

router.get("/my", requireAuth, subscriptionsController.getMine);

router.get("/my/active", requireAuth, subscriptionsController.getActive);

router.post(
  "/upgrade",
  requireAuth,
  validate(upgradeSubscriptionSchema),
  subscriptionsController.upgrade,
);

router.post(
  "/cancel",
  requireAuth,
  validate(cancelSubscriptionSchema),
  subscriptionsController.cancel,
);

router.post(
  "/:id/cancel",
  requireAuth,
  validate(cancelSubscriptionByIdSchema),
  subscriptionsController.cancelById,
);

export default router;
