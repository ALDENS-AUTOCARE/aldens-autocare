import { z } from "zod";

export const getPlansSchema = z.object({
  body: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
});

export const planCodeParamSchema = z.object({
  params: z.object({
    code: z.enum(["SIGNATURE", "EXECUTIVE", "FLEETCARE"]),
  }),
});
