import { validateData } from '@/middleware/validateData';
import { processNotificationEvent } from '@/service/NotificationEventService';
import { Router } from 'express';
import { notificationBodySchema } from './schema/processNotificationSchema';
import { ApiResponse } from '@/types/ApiResponse';

const router = Router();

router.post('/', validateData(notificationBodySchema), async (req, res): Promise<ApiResponse> => {
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
