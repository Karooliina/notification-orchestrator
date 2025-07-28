import { validateData } from '@/middleware/validateData';
import { processNotificationEvent } from '@/service/NotificationEventService';
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

router.post('/', validateData(notificationBodySchema), async (req, res) => {
  try {
    const result = await processNotificationEvent(req.body);

    if (result.decision === 'DO_NOT_NOTIFY') {
      res.status(200).json({ success: true, data: result });
      return;
    }

    res.status(202).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to process notification event' });
  }
});

export const notificationsRouter = router;
