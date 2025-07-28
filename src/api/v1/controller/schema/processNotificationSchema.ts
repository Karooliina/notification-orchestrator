import z from 'zod';

export const notificationBodySchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  eventType: z.string(),
  timestamp: z.string(),
  payload: z.object({
    orderId: z.string(),
    shippingCarrier: z.string(),
    trackingNumber: z.string(),
  }),
});
