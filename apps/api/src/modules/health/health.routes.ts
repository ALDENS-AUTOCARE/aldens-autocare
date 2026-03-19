import { Router } from "express";
import { sendSuccess } from "../../utils/response";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  return sendSuccess(res, "API is healthy", {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;

