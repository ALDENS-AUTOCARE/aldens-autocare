import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  bookingIdParamSchema,
  cancelBookingSchema,
  createBookingSchema,
} from "./bookings.schema";
import { bookingsController } from "./bookings.controller";

const router = Router();

router.post("/", requireAuth, validate(createBookingSchema), bookingsController.create);
router.get("/my", requireAuth, bookingsController.getMine);
router.get("/:id", requireAuth, validate(bookingIdParamSchema), bookingsController.getOne);
router.patch("/:id/cancel", requireAuth, validate(cancelBookingSchema), bookingsController.cancel);

export default router;

