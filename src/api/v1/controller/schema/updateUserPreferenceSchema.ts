import z from 'zod';

const updateNotificationPreferenceSchema = z.object({
  notification_type: z.string(),
  enabled: z.boolean().optional(),
  channels: z.array(z.enum(['email', 'sms', 'push'])).optional(),
});

const updateDndPreferenceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Do not disturb window name is required' }).optional(),
  day: z.number().min(0).max(6).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  all_day: z.boolean().optional(),
});

export const updateUserPreferencesSchema = z.object({
  notification_preferences: z.array(updateNotificationPreferenceSchema).optional(),
  dnd_preferences: z.array(updateDndPreferenceSchema).optional(),
});
