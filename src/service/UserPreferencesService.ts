import {
  getAllUserNotificationsSettings,
  setUserNotificationsSettings,
  updateUserNotificationsSettings,
} from '@/repository/userNotificationSettingsRepository';
import { setUserDNDSettings, updateUserDNDSettings, getAllUserDNDSettings } from '@/repository/userDNDRepository';
import { convertTimeToHoursAndMinutes } from '@/utils/convertTimeToHoursAndMinutes';

type NotificationPreference = {
  notification_type: string;
  enabled: boolean;
  channels: string[];
};

type DNDPreference = {
  id: string;
  name: string;
  days: number[];
  start_time: string;
  end_time: string;
};

type UserPreferences = {
  userId: string;
  notification_preferences: NotificationPreference[] | [];
  dnd_preferences: DNDPreference[] | [];
};

type UserDNDSettings = {
  id: string;
  name: string;
  days: number[];
  start_date: string;
  end_date: string;
};

type NewUserDNDSettings = Omit<UserDNDSettings, 'id'>;

type UserNotificationSettings = {
  notification_type: string;
  enabled: boolean;
  channels: string[];
};

async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const notificationPreferences = await getAllUserNotificationsSettings(userId);

  const notificationPreferencesArray =
    notificationPreferences.Items?.map((item) => ({
      notification_type: item.notificationType.S,
      enabled: item.enabled.BOOL,
      channels: item.channels?.SS || [],
    })) || [];

  const dndPreferences = await getAllUserDNDSettings(userId);

  const dndPreferencesArray =
    dndPreferences.Items?.map((item) => ({
      id: item.dndId.S,
      name: item.name.S,
      days: item.days.SS.map(Number),
      start_time: item.start_time.S,
      end_time: item.end_time.S,
    })) || [];

  return {
    userId,
    notification_preferences: notificationPreferencesArray,
    dnd_preferences: dndPreferencesArray,
  };
}

async function setUserPreferences(
  userId: string,
  notificationSettings: UserNotificationSettings[],
  dndSettings: NewUserDNDSettings[],
) {
  if (notificationSettings?.length) {
    for (const notificationSetting of notificationSettings) {
      await setUserNotificationsSettings(userId, {
        channels: notificationSetting.channels || [],
        enabled: notificationSetting.enabled,
        notification_type: notificationSetting.notification_type,
      });
    }
  }
  if (dndSettings?.length) {
    for (const dndSetting of dndSettings) {
      await setUserDNDSettings(userId, {
        name: dndSetting.name,
        days: dndSetting.days,
        start_time: convertTimeToHoursAndMinutes(dndSetting.start_date),
        end_time: convertTimeToHoursAndMinutes(dndSetting.end_date),
      });
    }
  }

  return 'User preferences set successfully';
}

async function updateUserPreferences(
  userId: string,
  notificationSettings: UserNotificationSettings[],
  dndSettings: UserDNDSettings[],
) {
  if (notificationSettings?.length) {
    for (const notificationSetting of notificationSettings) {
      await updateUserNotificationsSettings(userId, {
        notification_type: notificationSetting.notification_type,
        enabled: notificationSetting.enabled || undefined,
        channels: notificationSetting.channels || undefined,
      });
    }
  }
  if (dndSettings?.length) {
    for (const dndSetting of dndSettings) {
      await updateUserDNDSettings(userId, {
        id: dndSetting.id,
        name: dndSetting.name || undefined,
        days: dndSetting.days || undefined,
        start_time: convertTimeToHoursAndMinutes(dndSetting.start_date) || undefined,
        end_time: convertTimeToHoursAndMinutes(dndSetting.end_date) || undefined,
      });
    }
  }
  return 'User preferences updated successfully';
}

export { getUserPreferences, setUserPreferences, updateUserPreferences };
