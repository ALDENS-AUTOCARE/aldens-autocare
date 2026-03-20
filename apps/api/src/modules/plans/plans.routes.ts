import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { plansController } from "./plans.controller";
import { getPlansSchema, planCodeParamSchema } from "./plans.schema";

const router = Router();

router.get("/", validate(getPlansSchema), plansController.getAll);
router.get("/:code", validate(planCodeParamSchema), plansController.getOne);

export default router;
