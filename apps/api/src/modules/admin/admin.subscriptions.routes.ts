import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/requireRole.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  adminSubscriptionIdParamSchema,
  updateSubscriptionStatusSchema,
} from "./admin.subscriptions.schema";
import { adminSubscriptionsController } from "./admin.subscriptions.controller";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN", "SUPER_ADMIN"]));

router.get("/", adminSubscriptionsController.getSubscriptions);
router.patch(
  "/:id/status",
  validate(updateSubscriptionStatusSchema),
  adminSubscriptionsController.updateSubscriptionStatus
);

export default router;