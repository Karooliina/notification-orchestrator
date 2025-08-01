import z from 'zod';

const setNotificationPreferenceSchema = z.object({
  notification_type: z.string(),
  enabled: z.boolean(),
  channels: z.array(z.enum(['email', 'sms', 'push'])).optional(),
});

const setDndPreferenceSchema = z.object({
  name: z.string().min(1, { message: 'Do not disturb window name is required' }),
  day: z.number().min(0).max(6),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  all_day: z.boolean(),
});

export const setUserPreferencesSchema = z.object({
  notification_preferences: z.array(setNotificationPreferenceSchema).nullable(),
  dnd_preferences: z.array(setDndPreferenceSchema).nullable(),
});
