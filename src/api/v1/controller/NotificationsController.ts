import { validateData } from '@/middleware/validateData';
import { Router } from 'express';
import z from 'zod';

const router = Router();

const notificationBodySchema = z.object({
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

router.post('/', validateData(notificationBodySchema), (req, res) => {
  const { eventId, userId } = req.body;
  // TODO: Implement the logic to determine the decision
  res.status(200).json({
    decision: 'PROCESS_NOTIFICATION',
    eventId,
    userId,
    channels: ['email', 'push'],
    reason: 'NO_CHANNELS_CONFIGURED',
  });
});

export const notificationsRouter = router;
