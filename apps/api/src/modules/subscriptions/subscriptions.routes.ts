import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { initiateSubscriptionSchema, subscriptionIdParamSchema } from "./subscriptions.schema";
import { subscriptionsController } from "./subscriptions.controller";

const router = Router();

router.post(
  "/initiate",
  requireAuth,
  validate(initiateSubscriptionSchema),
  subscriptionsController.initiate,
);

router.get("/my", requireAuth, subscriptionsController.getMine);

router.get("/my/active", requireAuth, subscriptionsController.getActive);

router.post(
  "/:id/cancel",
  requireAuth,
  validate(subscriptionIdParamSchema),
  subscriptionsController.cancel,
);

export default router;
