import { Router } from 'express';
import { getUserPreferences, setUserPreferences, updateUserPreferences } from '@/service/UserPreferencesService';
import { validateData } from '@/middleware/validateData';
import { AuthorizedRequest } from '@/middleware/authMiddleware';
import { setUserPreferencesSchema } from './schema/setUserPreferenceSchema';
import { updateUserPreferencesSchema } from './schema/updateUserPreferenceSchema';
import { ApiResponse } from '@/types/ApiResponse';

const router = Router();

router.get('/:userId', async (req, res): Promise<ApiResponse> => {
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

router.post(
  '/:userId',
  validateData(setUserPreferencesSchema),
  async (req: AuthorizedRequest, res): Promise<ApiResponse> => {
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
      const setUserPreferencesResult = await setUserPreferences(userId, notification_preferences, dnd_preferences);
      res.status(200).json({ success: true, data: setUserPreferencesResult });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to set user preferences' });
    }
  },
);

router.put(
  '/:userId',
  validateData(updateUserPreferencesSchema),
  async (req: AuthorizedRequest, res): Promise<ApiResponse> => {
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
      const updateUserPreferencesResult = await updateUserPreferences(
        userId,
        notification_preferences,
        dnd_preferences,
      );
      res.status(200).json({ success: true, data: updateUserPreferencesResult });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to update user preferences' });
    }
  },
);

export const userPreferencesRouter = router;
