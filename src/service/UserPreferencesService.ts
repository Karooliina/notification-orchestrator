import {
  getAllUserNotificationsSettings,
  setUserNotificationsSettings,
  updateUserNotificationsSettings,
} from '@/repository/userNotificationSettingsRepository';
import { setUserDNDSettings, updateUserDNDSettings, getAllUserDNDSettings } from '@/repository/userDNDRepository';

type NotificationPreference = {
  notification_type: string;
  enabled: boolean;
  channels: string[];
};

type DNDPreference = {
  dnd_name: string;
  dnd_weekdays: number[];
  dnd_start_time: string;
  dnd_end_time: string;
};

type UserPreferences = {
  userId: string;
  notification_preferences: NotificationPreference[] | [];
  dnd_preferences: DNDPreference[] | [];
};

type UserDNDSettings = {
  dnd_name: string;
  dnd_weekdays: number[];
  dnd_start_time: string;
  dnd_end_time: string;
};

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
      dnd_name: item.dnd_name.S,
      dnd_weekdays: item.dnd_weekdays.SS.map(Number),
      dnd_start_time: item.dnd_start_time.S,
      dnd_end_time: item.dnd_end_time.S,
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
  dndSettings: UserDNDSettings[],
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
        dnd_name: dndSetting.dnd_name,
        dnd_weekdays: dndSetting.dnd_weekdays,
        dnd_start_time: dndSetting.dnd_start_time,
        dnd_end_time: dndSetting.dnd_end_time,
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
      await updateUserNotificationsSettings(userId, notificationSetting);
    }
  }
  if (dndSettings?.length) {
    for (const dndSetting of dndSettings) {
      await updateUserDNDSettings(userId, dndSetting);
    }
  }
  return 'User preferences updated successfully';
}

export { getUserPreferences, setUserPreferences, updateUserPreferences };
