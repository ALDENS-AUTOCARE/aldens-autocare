import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/requireRole.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { adminController } from "./admin.controller";
import {
	adminBookingIdParamSchema,
	updateBookingStatusSchema,
} from "./admin.schema";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN", "SUPER_ADMIN"]));

router.get("/bookings", adminController.getBookings);
router.get("/bookings/:id", validate(adminBookingIdParamSchema), adminController.getBookingById);
router.patch(
	"/bookings/:id/status",
	validate(updateBookingStatusSchema),
	adminController.updateBookingStatus
);
router.get("/customers", adminController.getCustomers);

export default router;


