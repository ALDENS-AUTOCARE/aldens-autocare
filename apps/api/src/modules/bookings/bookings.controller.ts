import { Request, Response } from "express";
import { bookingsService } from "./bookings.service";
import { sendSuccess, sendError } from "../../utils/response";

export const bookingsController = {
  async create(req: Request, res: Response) {
    try {
      const booking = await bookingsService.create(req.user!.id, req.body);
      return sendSuccess(res, "Booking created successfully", { booking }, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },

  async getMine(req: Request, res: Response) {
    const bookings = await bookingsService.findMine(req.user!.id);
    return sendSuccess(res, "Bookings fetched successfully", { bookings });
  },

  async getOne(req: Request<{ id: string }>, res: Response) {
    try {
      const booking = await bookingsService.findOneForUser(
        req.user!.id,
        req.params.id,
        req.user!.role
      );
      return sendSuccess(res, "Booking fetched successfully", { booking });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },

  async cancel(req: Request<{ id: string }>, res: Response) {
    try {
      const booking = await bookingsService.cancel(req.user!.id, req.params.id);
      return sendSuccess(res, "Booking cancelled successfully", { booking });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 400);
    }
  },
};


