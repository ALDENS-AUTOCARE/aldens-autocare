import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { usersService } from "./users.service";

export const usersController = {
	async getMe(req: Request, res: Response) {
		try {
			const user = await usersService.getCurrentUserProfile(req.user!.id);
			return sendSuccess(res, "Current user fetched successfully", { user });
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch current user";
			const status = message === "User not found" ? 404 : 500;
			return sendError(res, message, [], status);
		}
	},

	async updateMe(req: Request, res: Response) {
		try {
			const user = await usersService.updateCurrentUserProfile(req.user!.id, req.body);
			return sendSuccess(res, "Profile updated successfully", { user });
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to update profile";
			const status = message === "User not found" ? 404 : 400;
			return sendError(res, message, [], status);
		}
	},
};

