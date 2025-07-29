import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import { clearTestData, setupTestDb, teardownTestDb } from '@/__test__/setupTestDb';

vi.mock('@/db/withDBClient', () => ({
  default: async (fn) => {
    const { withDBClientMock } = await import('@/__test__/withDBClientMock');
    return withDBClientMock(fn);
  },
}));

const mockNotificationEvent = {
  eventId: '1',
  userId: 'user-test',
  eventType: 'order_created',
  timestamp: '2021-01-01T00:00:00.000Z',
  payload: {
    orderId: '1',
    shippingCarrier: 'UPS',
    trackingNumber: '1234567890',
  },
};

const userId = process.env.TEST_USER_ID;

describe('NotificationsController', () => {
  beforeAll(async () => {
    await setupTestDb();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for db to be ready, naive approach.
  });

  afterAll(async () => {
    await teardownTestDb();
    vi.clearAllMocks();
  });

  it('GET /api/v1/notifications should return 200 if notification event is processed and notification setting is not sent', async () => {
    const response = await fetch(`http://localhost:4002/api/v1/notifications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockNotificationEvent),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '1',
      reason: 'NO_NOTIFICATION_SETTINGS_CONFIGURED',
      userId: 'user-test',
    });
  });

  it('GET /api/v1/notifications should return 200 for: notification event is processed and notification is disabled', async () => {
    const setNotificationSettingsResponse = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_preferences: [
          {
            notification_type: 'order_created',
            enabled: false,
            channels: ['email'],
          },
        ],
        dnd_preferences: [],
      }),
    });

    await vi.waitFor(
      () => {
        return setNotificationSettingsResponse.status === 200;
      },
      { timeout: 500, interval: 5 },
    );

    const response = await fetch(`http://localhost:4002/api/v1/notifications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockNotificationEvent),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.decision).toBe('DO_NOT_NOTIFY');
    expect(data.data).toEqual({
      decision: 'DO_NOT_NOTIFY',
      eventId: '1',
      reason: 'USER_UNSUBSCRIBED',
      userId: 'user-test',
    });

    await clearTestData('UserNotification', { userId: { S: 'user-test' }, notificationType: { S: 'order_created' } });
  });

  it('GET /api/v1/notifications should return 202 for: notification event is processed and notification is enabled', async () => {
    const setNotificationSettingsResponse = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_preferences: [
          {
            notification_type: 'order_created',
            enabled: true,
            channels: ['email'],
          },
        ],
        dnd_preferences: [],
      }),
    });

    await vi.waitFor(
      () => {
        return setNotificationSettingsResponse.status === 200;
      },
      { timeout: 500, interval: 5 },
    );

    const response = await fetch(`http://localhost:4002/api/v1/notifications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockNotificationEvent),
    });

    const data = await response.json();
    expect(response.status).toBe(202);
    expect(data.success).toBe(true);
    expect(data.data.decision).toBe('PROCESS_NOTIFICATION');
    expect(data.data).toEqual({
      channels: ['email'],
      decision: 'PROCESS_NOTIFICATION',
      eventId: '1',
      userId: 'user-test',
    });

    await clearTestData('UserNotification', { userId: { S: 'user-test' }, notificationType: { S: 'order_created' } });
  });

  it('GET /api/v1/notifications should return 200 for: notification event is processed and DND is enabled', async () => {
    const currentDay = new Date().getUTCDay();

    const setNotificationSettingsResponse = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_preferences: [],
        dnd_preferences: [
          {
            name: 'DND',
            day: currentDay,
            start_date: '2021-01-01T00:00:00.000Z',
            end_date: '2021-01-01T23:59:59.000Z',
            all_day: true,
          },
        ],
      }),
    });

    await vi.waitFor(
      () => {
        return setNotificationSettingsResponse.status === 200;
      },
      { timeout: 500, interval: 5 },
    );

    const response = await fetch(`http://localhost:4002/api/v1/notifications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockNotificationEvent),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.decision).toBe('DO_NOT_NOTIFY');
    expect(data.data.reason).toBe('USER_DND_ACTIVE');

    await clearTestData('UserDND', { userId: { S: 'user-test' }, dndId: { S: 'DND' } });
  });
});
