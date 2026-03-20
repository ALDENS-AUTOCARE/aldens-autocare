import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  cancelSubscriptionSchema,
  checkoutSubscriptionSchema,
  upgradeSubscriptionSchema,
} from "./subscriptions.schema";
import { subscriptionsController } from "./subscriptions.controller";

const router = Router();

router.use(requireAuth);

router.get("/me", subscriptionsController.getMe);
router.get("/usage", subscriptionsController.getUsage);
router.get("/capabilities", subscriptionsController.getCapabilities);
router.post("/checkout", validate(checkoutSubscriptionSchema), subscriptionsController.checkout);
router.post("/cancel", validate(cancelSubscriptionSchema), subscriptionsController.cancel);
router.post("/upgrade", validate(upgradeSubscriptionSchema), subscriptionsController.upgrade);

export default router;
