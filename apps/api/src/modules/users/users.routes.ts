import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateProfileRequestSchema } from "./users.schema";
import { usersController } from "./users.controller";

const router = Router();

router.use(requireAuth);
router.get("/me", usersController.getMe);
router.patch("/me", validate(updateProfileRequestSchema), usersController.updateMe);

export default router;

