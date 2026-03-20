import { Router } from "express";
import { plansController } from "./plans.controller";

const router = Router();

router.get("/", plansController.getAll);
router.get("/:code", plansController.getOne);

export default router;
