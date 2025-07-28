import { getUserActiveDNDSettings } from '@/repository/userDNDRepository';
import { getUserNotificationsSettingsByType } from '@/repository/userNotificationSettingsRepository';
import { getCurrentDayAndTime } from '@/utils/getCurrentDayAndTime';

type NotificationEvent = {
  eventId: string;
  userId: string;
  eventType: string;
  timestamp: string;
  payload: {
    orderId: string;
    shippingCarrier: string;
    trackingNumber: string;
  };
};

enum NotificationDecisionEnum {
  DO_NOT_NOTIFY = 'DO_NOT_NOTIFY',
  PROCESS_NOTIFICATION = 'PROCESS_NOTIFICATION',
}

enum NotificationReasonEnum {
  USER_UNSUBSCRIBED = 'USER_UNSUBSCRIBED',
  NO_CHANNELS_CONFIGURED = 'NO_CHANNELS_CONFIGURED',
  USER_DND_ACTIVE = 'USER_DND_ACTIVE',
  NO_NOTIFICATION_SETTINGS_CONFIGURED = 'NO_NOTIFICATION_SETTINGS_CONFIGURED',
}

type ProcessedNotificationResult = {
  decision: NotificationDecisionEnum;
  eventId: string;
  userId: string;
  reason?: NotificationReasonEnum;
  channels?: string[];
};

async function processNotificationEvent(event: NotificationEvent): Promise<ProcessedNotificationResult> {
  const { eventId, userId, eventType } = event;

  const userNotifications = await getUserNotificationsSettingsByType(userId, eventType);

  const { currentDay, currentTime } = getCurrentDayAndTime();

  const userDND = await getUserActiveDNDSettings(userId, currentDay, currentTime);

  if (!userNotifications.Items.length || !userDND.Items.length) {
    return {
      decision: NotificationDecisionEnum.PROCESS_NOTIFICATION,
      eventId,
      userId,
      reason: NotificationReasonEnum.NO_NOTIFICATION_SETTINGS_CONFIGURED,
    };
  }

  const { Items: userNotificationsItems } = userNotifications;
  const { Items: userDNDItems } = userDND;

  if (!userNotificationsItems.some((item) => item.enabled)) {
    return {
      decision: NotificationDecisionEnum.DO_NOT_NOTIFY,
      eventId,
      userId,
      reason: NotificationReasonEnum.USER_UNSUBSCRIBED,
    };
  }

  if (userNotificationsItems.some((item) => item.channels.SS.length === 0)) {
    return {
      decision: NotificationDecisionEnum.DO_NOT_NOTIFY,
      eventId,
      userId,
      reason: NotificationReasonEnum.NO_CHANNELS_CONFIGURED,
    };
  }

  if (userDNDItems.length) {
    return {
      decision: NotificationDecisionEnum.DO_NOT_NOTIFY,
      eventId,
      userId,
      reason: NotificationReasonEnum.USER_DND_ACTIVE,
    };
  }

  return {
    decision: NotificationDecisionEnum.PROCESS_NOTIFICATION,
    eventId,
    userId,
    channels: userNotificationsItems[0].channels.SS,
  };
}

export { processNotificationEvent };
