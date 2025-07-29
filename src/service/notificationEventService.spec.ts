import { describe, it, expect, vi, beforeAll } from 'vitest';
import { processNotificationEvent } from './notificationEventService';
import { getUserNotificationsSettingsByType } from '@/repository/userNotificationSettingsRepository';
import { getUserActiveDNDSettings } from '@/repository/userDNDRepository';

const mockNotificationEvent = {
  eventId: '123',
  userId: '456',
  eventType: 'ORDER_CREATED',
  timestamp: '2025-01-01T12:00:00.000Z',
  payload: {
    orderId: '789',
    shippingCarrier: 'UPS',
    trackingNumber: '1234567890',
  },
};

vi.mock('@/repository/userNotificationSettingsRepository', () => ({
  getUserNotificationsSettingsByType: vi.fn(),
}));

vi.mock('@/repository/userDNDRepository', () => ({
  getUserActiveDNDSettings: vi.fn(),
}));

vi.mock('@/utils/getCurrentDayAndTime', () => ({
  getCurrentDayAndTime: vi.fn().mockReturnValue({ currentDay: 1, currentTime: '12:00' }),
}));

describe('NotificationEventService', () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
  });

  it('should return a notification event: DO_NOT_NOTIFY and reason: NO_NOTIFICATION_SETTINGS_CONFIGURED', async () => {
    vi.mocked(getUserNotificationsSettingsByType).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(getUserActiveDNDSettings).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await processNotificationEvent(mockNotificationEvent);
    expect(result).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '123',
      reason: 'NO_NOTIFICATION_SETTINGS_CONFIGURED',
      userId: '456',
    });
  });

  it('should return a notification event: PROCESS_NOTIFICATION and channels: ["email"]', async () => {
    vi.mocked(getUserNotificationsSettingsByType).mockResolvedValue({
      Items: [
        {
          userId: { S: mockNotificationEvent.userId },
          notificationType: { S: mockNotificationEvent.eventType },
          enabled: { BOOL: true },
          channels: { SS: ['email'] },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(getUserActiveDNDSettings).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await processNotificationEvent(mockNotificationEvent);
    expect(result).toEqual({
      channels: ['email'],
      decision: 'PROCESS_NOTIFICATION',
      eventId: '123',
      userId: '456',
    });
  });

  it('should return a notification event: DO_NOT_NOTIFY and reason: USER_UNSUBSCRIBED', async () => {
    vi.mocked(getUserNotificationsSettingsByType).mockResolvedValue({
      Items: [
        {
          userId: { S: mockNotificationEvent.userId },
          notificationType: { S: mockNotificationEvent.eventType },
          enabled: { BOOL: false },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(getUserActiveDNDSettings).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await processNotificationEvent(mockNotificationEvent);
    expect(result).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '123',
      reason: 'USER_UNSUBSCRIBED',
      userId: '456',
    });
  });

  it('should return a notification event: DO_NOT_NOTIFY and reason: NO_CHANNELS_CONFIGURED', async () => {
    vi.mocked(getUserNotificationsSettingsByType).mockResolvedValue({
      Items: [
        {
          userId: { S: mockNotificationEvent.userId },
          notificationType: { S: mockNotificationEvent.eventType },
          enabled: { BOOL: true },
          channels: { SS: [] },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(getUserActiveDNDSettings).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await processNotificationEvent(mockNotificationEvent);
    expect(result).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '123',
      reason: 'NO_CHANNELS_CONFIGURED',
      userId: '456',
    });
  });

  it('should return a notification event: DO_NOT_NOTIFY and reason: USER_DND_ACTIVE', async () => {
    vi.mocked(getUserNotificationsSettingsByType).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(getUserActiveDNDSettings).mockResolvedValue({
      Items: [
        {
          userId: { S: mockNotificationEvent.userId },
          name: { S: 'DND' },
          day: { S: '2' },
          startTime: { S: '10:00' },
          endTime: { S: '18:00' },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await processNotificationEvent(mockNotificationEvent);
    expect(result).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '123',
      reason: 'USER_DND_ACTIVE',
      userId: '456',
    });
  });

  it('should return a notification event: DO_NOT_NOTIFY and reason: USER_DND_ACTIVE when user has many DND settings', async () => {
    vi.mocked(getUserNotificationsSettingsByType).mockResolvedValue({
      Items: [],
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(getUserActiveDNDSettings).mockResolvedValue({
      Items: [
        {
          userId: { S: mockNotificationEvent.userId },
          name: { S: 'DND' },
          day: { S: '1' },
          startTime: { S: '10:00' },
          endTime: { S: '18:00' },
        },
        {
          userId: { S: mockNotificationEvent.userId },
          name: { S: 'DND' },
          day: { S: '2' },
          startTime: { S: '9:00' },
          endTime: { S: '17:00' },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await processNotificationEvent(mockNotificationEvent);
    expect(result).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '123',
      reason: 'USER_DND_ACTIVE',
      userId: '456',
    });
  });
});
