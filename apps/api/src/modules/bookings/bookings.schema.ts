import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    vehicleType: z.string().trim().min(2).max(50),
    vehicleMake: z.string().trim().max(50).optional(),
    vehicleModel: z.string().trim().max(50).optional(),
    vehicleColor: z.string().trim().max(30).optional(),
    vehiclePlate: z.string().trim().max(20).optional(),
    serviceAddress: z.string().trim().min(10).max(300),
    locationArea: z.string().trim().max(100).optional(),
    scheduledDate: z.string().datetime(),
    notes: z.string().trim().max(1000).optional(),
    useIncludedBooking: z.boolean().optional(),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const cancelBookingSchema = bookingIdParamSchema;

