import { getUserDNDSettings } from '@/repository/userDNDRepository';
import { getUserNotificationsSettingsByType } from '@/repository/userNotificationSettingsRepository';

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
}

type ProcessedNotificationResult = {
  decision: NotificationDecisionEnum;
  eventId: string;
  userId: string;
  reason?: NotificationReasonEnum;
  channels?: string[];
};

//TODO Fix this function
async function processNotificationEvent(event: NotificationEvent): Promise<ProcessedNotificationResult> {
  const { eventId, userId, eventType } = event;

  const userNotifications = await getUserNotificationsSettingsByType(userId, eventType);
  const userDND = await getUserDNDSettings(userId);

  if (!userNotifications || !userDND) {
    return;
  }

  const { Item } = userNotifications;
  const { enabled, channels } = Item;

  if (!enabled) {
    return {
      decision: NotificationDecisionEnum.DO_NOT_NOTIFY,
      eventId,
      userId,
      reason: NotificationReasonEnum.USER_UNSUBSCRIBED,
    };
  }

  if (channels.SS.length === 0) {
    return {
      decision: NotificationDecisionEnum.DO_NOT_NOTIFY,
      eventId,
      userId,
      reason: NotificationReasonEnum.NO_CHANNELS_CONFIGURED,
    };
  }

  if (userDND) {
    const { Item } = userDND;
    const { dnd_day, dnd_start_time, dnd_end_time } = Item;
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const currentTime = currentDate.getHours();

    const isCurrentTimeInDND = currentTime >= Number(dnd_start_time.S) && currentTime <= Number(dnd_end_time.S);

    if (Number(dnd_day.N) === currentDay && isCurrentTimeInDND) {
      return {
        decision: NotificationDecisionEnum.DO_NOT_NOTIFY,
        eventId,
        userId,
        reason: NotificationReasonEnum.USER_DND_ACTIVE,
      };
    }
  }

  return {
    decision: NotificationDecisionEnum.PROCESS_NOTIFICATION,
    eventId,
    userId,
    channels: channels.SS,
  };
}

export { processNotificationEvent };
