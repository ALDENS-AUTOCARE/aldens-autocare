import { Request, Response } from "express";
import { plansService } from "./plans.service";
import { sendError, sendSuccess } from "../../utils/response";

export const plansController = {
  async getAll(_req: Request, res: Response) {
    const plans = await plansService.findAll();
    return sendSuccess(res, "Plans fetched successfully", { plans });
  },

  async getOne(req: Request, res: Response) {
    try {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const plan = await plansService.findByCode(code);
      return sendSuccess(res, "Plan fetched successfully", { plan });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },
};
