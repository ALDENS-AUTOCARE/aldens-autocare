import { Router } from "express";
import { servicesController } from "./services.controller";

const router = Router();

router.get("/", servicesController.getAll);
router.get("/:slug", servicesController.getOne);

export default router;

