import { Router } from 'express';
import { getUserPreferences, setUserPreferences, updateUserPreferences } from '@/service/UserPreferencesService';
import z from 'zod';
import { validateData } from '@/middleware/validateData';
import { AuthorizedRequest } from '@/middleware/authMiddleware';

const router = Router();

const notificationPreferenceSchema = z.object({
  notification_type: z.string(),
  enabled: z.boolean(),
  channels: z.array(z.enum(['email', 'sms', 'push'])).optional(),
});

const dndPreferenceSchema = z.object({
  dnd_name: z.string().min(1, { message: 'Do not disturb window name is required' }),
  dnd_weekdays: z.array(z.number().min(0).max(6)),
  dnd_start_time: z.string(),
  dnd_end_time: z.string(),
});

const userPreferencesSchema = z.object({
  notification_preferences: z.array(notificationPreferenceSchema).optional(),
  dnd_preferences: z.array(dndPreferenceSchema).optional(),
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { notification_preferences, dnd_preferences } = await getUserPreferences(userId);
    if (!notification_preferences?.length && !dnd_preferences?.length) {
      res.status(404).json({ success: false, error: 'User preferences not found' });
      return;
    }
    res.status(200).json({ success: true, data: { userId, notification_preferences, dnd_preferences } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to get user preferences' });
  }
});

router.post('/:userId', validateData(userPreferencesSchema), async (req: AuthorizedRequest, res) => {
  const { authorizedUserId } = req;
  const { userId } = req.params;
  const { notification_preferences, dnd_preferences } = req.body;

  if (authorizedUserId !== userId) {
    res.status(401).json({ success: false, error: 'You are not allowed to modify this resource' });
    return;
  }

  if (!notification_preferences?.length && !dnd_preferences?.length) {
    res.status(400).json({ success: false, error: 'No notification or DND settings provided' });
    return;
  }

  if (dnd_preferences?.length) {
    dnd_preferences.some((dnd) => {
      if (!dnd.dnd_weekdays?.length && !dnd.dnd_start_time && !dnd.dnd_end_time) {
        res.status(400).json({ success: false, error: 'DND weekdays are required' });
        return;
      }
    });
  }
  try {
    const setUserPreferencesResult = await setUserPreferences(userId, notification_preferences, dnd_preferences);
    res.status(200).json({ success: true, data: setUserPreferencesResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to set user preferences' });
  }
});

router.put('/:userId', validateData(userPreferencesSchema), async (req: AuthorizedRequest, res) => {
  const { authorizedUserId } = req;
  const { userId } = req.params;
  const { notification_preferences, dnd_preferences } = req.body;

  if (authorizedUserId !== userId) {
    res.status(401).json({ success: false, error: 'You are not allowed to modify this resource' });
    return;
  }

  if (!notification_preferences?.length && !dnd_preferences?.length) {
    res.status(400).json({ success: false, error: 'No notification or DND settings provided' });
    return;
  }
  try {
    const updateUserPreferencesResult = await updateUserPreferences(userId, notification_preferences, dnd_preferences);
    res.status(200).json({ success: true, data: updateUserPreferencesResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update user preferences' });
  }
});

export const userPreferencesRouter = router;
