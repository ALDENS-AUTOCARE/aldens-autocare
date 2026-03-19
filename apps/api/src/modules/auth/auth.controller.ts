import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, "Account created successfully", result, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 409);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, "Login successful", result);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 401);
    }
  },

  async me(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await authService.me(userId);
      return sendSuccess(res, "Current user fetched successfully", { user });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },
};

