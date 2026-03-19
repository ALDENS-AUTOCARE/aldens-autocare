import { Request, Response } from "express";
import { servicesService } from "./services.service";
import { sendError, sendSuccess } from "../../utils/response";

export const servicesController = {
  async getAll(_req: Request, res: Response) {
    const services = await servicesService.findAll();
    return sendSuccess(res, "Services fetched successfully", { services });
  },

  async getOne(req: Request<{ slug: string }>, res: Response) {
    try {
      const service = await servicesService.findOneBySlug(req.params.slug);
      return sendSuccess(res, "Service fetched successfully", { service });
    } catch (error) {
      return sendError(res, (error as Error).message, [], 404);
    }
  },
};

