import { Request, Response } from "express";
import { plansService } from "./plans.service";
import { sendError, sendSuccess } from "../../utils/response";

export const plansController = {
  async getAll(_req: Request, res: Response) {
    const plans = await plansService.findAllActive();
    return sendSuccess(res, "Plans fetched successfully", { plans });
  },

  async getOne(req: Request<{ code: string }>, res: Response) {
    try {
      const plan = await plansService.findByCode(req.params.code);
      return sendSuccess(res, "Plan fetched successfully", { plan });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },
};
