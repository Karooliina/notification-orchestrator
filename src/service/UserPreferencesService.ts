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
  day: number;
  start_time: string;
  end_time: string;
  all_day: boolean;
};

type UserPreferences = {
  userId: string;
  notification_preferences: NotificationPreference[] | [];
  dnd_preferences: DNDPreference[] | [];
};

type UserDNDSettings = {
  id: string;
  name: string;
  day: number;
  start_date?: string;
  end_date?: string;
  all_day: boolean;
};

type NewUserDNDSettings = Omit<UserDNDSettings, 'id'>;

type UserNotificationSettings = {
  notification_type: string;
  enabled: boolean;
  channels: string[];
};

async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
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
        day: Number(item.day.N),
        start_time: item.start_time.S,
        end_time: item.end_time.S,
        all_day: item.all_day.BOOL,
      })) || [];

    return {
      userId,
      notification_preferences: notificationPreferencesArray,
      dnd_preferences: dndPreferencesArray,
    };
  } catch (error) {
    console.error(`Failed to get user preferences for user ${userId}: ${error}`);
    return {
      userId,
      notification_preferences: [],
      dnd_preferences: [],
    };
  }
}

async function setUserPreferences(
  userId: string,
  notificationSettings: UserNotificationSettings[],
  dndSettings: NewUserDNDSettings[],
) {
  try {
    if (!notificationSettings?.length && !dndSettings?.length) {
      return 'No user preferences or DND settings provided';
    }

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
          day: dndSetting.day,
          all_day: dndSetting.all_day,
          start_time: dndSetting.all_day ? '00:00' : convertTimeToHoursAndMinutes(dndSetting.start_date),
          end_time: dndSetting.all_day ? '23:59' : convertTimeToHoursAndMinutes(dndSetting.end_date),
        });
      }
    }

    return 'User preferences set successfully';
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to set user preferences: ${error}`);
  }
}

async function updateUserPreferences(
  userId: string,
  notificationSettings: UserNotificationSettings[],
  dndSettings: UserDNDSettings[],
) {
  try {
    if (notificationSettings?.length) {
      for (const notificationSetting of notificationSettings) {
        await updateUserNotificationsSettings(userId, {
          notification_type: notificationSetting.notification_type,
          enabled: notificationSetting.enabled,
          channels: notificationSetting.channels,
        });
      }
    }
    if (dndSettings?.length) {
      for (const dndSetting of dndSettings) {
        await updateUserDNDSettings(userId, {
          id: dndSetting.id,
          name: dndSetting.name,
          day: dndSetting.day,
          all_day: dndSetting.all_day,
          start_time: dndSetting.all_day ? '00:00' : convertTimeToHoursAndMinutes(dndSetting.start_date),
          end_time: dndSetting.all_day ? '23:59' : convertTimeToHoursAndMinutes(dndSetting.end_date),
        });
      }
    }
    return 'User preferences updated successfully';
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to update user preferences: ${error}`);
  }
}

export { getUserPreferences, setUserPreferences, updateUserPreferences };
