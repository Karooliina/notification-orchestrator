import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import { clearTestData, setupTestDb, teardownTestDb } from '@/__test__/setupTestDb';

vi.mock('@/db/withDBClient', () => ({
  default: async (fn) => {
    const { withDBClientMock } = await import('@/__test__/withDBClientMock');
    return withDBClientMock(fn);
  },
}));

const userId = process.env.TEST_USER_ID;

describe('UserPreferencesController', () => {
  beforeAll(async () => {
    await setupTestDb();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for db to be ready, naive approach.
  });

  afterAll(async () => {
    await teardownTestDb();
    vi.clearAllMocks();
  });

  it('GET user-preferences/:userId should return 401 if user is not authorized', async () => {
    const response = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('GET user-preferences/:userId should return 200 if user preferences are found', async () => {
    const createResponse = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
      },
      body: JSON.stringify({
        notification_preferences: [
          {
            notification_type: 'email',
            enabled: true,
            channels: ['email'],
          },
        ],
        dnd_preferences: [],
      }),
    });
    await vi.waitFor(
      () => {
        return createResponse.status === 200;
      },
      { timeout: 500, interval: 5 },
    );

    const response = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
      },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.userId).toBe(userId);
    expect(data.data.notification_preferences).toEqual([
      {
        notification_type: 'email',
        enabled: true,
        channels: ['email'],
      },
    ]);
    expect(data.data.dnd_preferences).toEqual([]);

    await clearTestData('UserNotification', { userId: { S: 'user-test' }, notificationType: { S: 'email' } });
  });

  it('GET user-preferences/:userId should return 404 if user preferences are not found', async () => {
    const response = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
      },
    });
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User preferences not found');
  });

  it('POST user-preferences/:userId should return 200 if user preferences are created', async () => {
    const response = await fetch(`http://localhost:4002/api/v1/user-preferences/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
      },
      body: JSON.stringify({
        notification_preferences: [
          {
            notification_type: 'email',
            enabled: true,
            channels: ['email'],
          },
        ],
        dnd_preferences: [],
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBe('User preferences set successfully');

    await clearTestData('UserNotification', { userId: { S: 'user-test' }, notificationType: { S: 'email' } });
  });
});
