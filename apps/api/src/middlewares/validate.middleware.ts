import { AnyZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const zodError = error as ZodError;
      return sendError(
        res,
        "Validation failed",
        zodError.errors.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
        400
      );
    }
  };
}
