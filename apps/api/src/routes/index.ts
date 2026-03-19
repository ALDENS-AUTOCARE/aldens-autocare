import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import servicesRoutes from "../modules/services/services.routes";
import bookingsRoutes from "../modules/bookings/bookings.routes";
import adminRoutes from "../modules/admin/admin.routes";
import paymentsRoutes from "../modules/payments/payments.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/services", servicesRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/admin", adminRoutes);

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
