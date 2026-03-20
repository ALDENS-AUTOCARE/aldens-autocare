import { z } from "zod";

export const planCodeParamSchema = z.object({
  params: z.object({
    code: z.string().min(1),
  }),
});
