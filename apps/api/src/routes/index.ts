import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import servicesRoutes from "../modules/services/services.routes";
import bookingsRoutes from "../modules/bookings/bookings.routes";
import adminRoutes from "../modules/admin/admin.routes";
import paymentsRoutes from "../modules/payments/payments.routes";
import plansRoutes from "../modules/plans/plans.routes";
import subscriptionsRoutes from "../modules/subscriptions/subscriptions.routes";
import adminSubscriptionsRoutes from "../modules/admin/admin.subscriptions.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/services", servicesRoutes);
router.use("/plans", plansRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/subscriptions", adminSubscriptionsRoutes);

router.get("/health", (_req, res) => {
	res.status(200).json({
		success: true,
		message: "API is healthy",
		data: {
			status: "ok",
			timestamp: new Date().toISOString(),
		},
	});
});

export default router;
