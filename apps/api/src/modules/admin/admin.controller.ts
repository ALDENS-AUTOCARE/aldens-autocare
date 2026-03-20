import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { sendError, sendSuccess } from "../../utils/response";

export const adminController = {
  async getBookings(_req: Request, res: Response) {
    const bookings = await adminService.getBookings();
    return sendSuccess(res, "Admin bookings fetched successfully", { bookings });
  },

  async getBookingById(req: Request<{ id: string }>, res: Response) {
    try {
      const booking = await adminService.getBookingById(req.params.id);
      return sendSuccess(res, "Booking fetched successfully", { booking });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },

  async updateBookingStatus(req: Request<{ id: string }>, res: Response) {
    try {
      const booking = await adminService.updateBookingStatus(req.params.id, req.body.status);
      return sendSuccess(res, "Booking status updated successfully", { booking });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 409);
    }
  },

  async getCustomers(_req: Request, res: Response) {
    const customers = await adminService.getCustomers();
    return sendSuccess(res, "Customers fetched successfully", { customers });
  },

  async updateSubscriptionStatus(req: Request<{ id: string }>, res: Response) {
    try {
      const subscription = await adminService.updateSubscriptionStatus(req.params.id, req.body.status);
      return sendSuccess(res, "Subscription status updated successfully", { subscription });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 409);
    }
  },
};


