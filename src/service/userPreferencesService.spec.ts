import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { getUserPreferences, setUserPreferences, updateUserPreferences } from './userPreferencesService';

vi.mock('@/repository/userNotificationSettingsRepository', () => ({
  getAllUserNotificationsSettings: vi.fn(),
  setUserNotificationsSettings: vi.fn(),
  updateUserNotificationsSettings: vi.fn(),
}));

vi.mock('@/repository/userDNDRepository', () => ({
  getAllUserDNDSettings: vi.fn(),
  setUserDNDSettings: vi.fn(),
  updateUserDNDSettings: vi.fn(),
}));

vi.mock('@/utils/convertTimeToHoursAndMinutes', () => ({
  convertTimeToHoursAndMinutes: vi.fn().mockReturnValue('12:00'),
}));

import {
  getAllUserNotificationsSettings,
  setUserNotificationsSettings,
  updateUserNotificationsSettings,
} from '@/repository/userNotificationSettingsRepository';
import { getAllUserDNDSettings, setUserDNDSettings, updateUserDNDSettings } from '@/repository/userDNDRepository';

describe('UserPreferencesService', () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should return the correct user preferences', async () => {
    vi.mocked(getAllUserNotificationsSettings).mockResolvedValue({
      Items: [
        {
          notificationType: { S: 'email' },
          enabled: { BOOL: true },
          channels: { SS: ['email', 'sms'] },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    vi.mocked(getAllUserDNDSettings).mockResolvedValue({
      Items: [
        {
          dndId: { S: 'dnd-123' },
          name: { S: 'Work Hours' },
          day: { N: '1' },
          start_time: { S: '09:00' },
          end_time: { S: '17:00' },
          all_day: { BOOL: false },
        },
      ],
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await getUserPreferences('123');

    expect(result).toEqual({
      userId: '123',
      notification_preferences: [
        {
          notification_type: 'email',
          enabled: true,
          channels: ['email', 'sms'],
        },
      ],
      dnd_preferences: [
        {
          id: 'dnd-123',
          name: 'Work Hours',
          day: 1,
          start_time: '09:00',
          end_time: '17:00',
          all_day: false,
        },
      ],
    });
  });

  it('should set the correct user preferences', async () => {
    vi.mocked(setUserNotificationsSettings).mockResolvedValue({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(setUserDNDSettings).mockResolvedValue({
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await setUserPreferences(
      '123',
      [{ notification_type: 'email', enabled: true, channels: ['email'] }],
      [
        {
          name: 'Work Hours',
          day: 1,
          start_date: '2025-01-01T09:00:00.000Z',
          end_date: '2025-01-01T17:00:00.000Z',
          all_day: false,
        },
      ],
    );

    expect(result).toEqual('User preferences set successfully');
    expect(setUserNotificationsSettings).toHaveBeenCalledWith('123', {
      channels: ['email'],
      enabled: true,
      notification_type: 'email',
    });
    expect(setUserDNDSettings).toHaveBeenCalledWith('123', {
      name: 'Work Hours',
      day: 1,
      start_time: '12:00',
      end_time: '12:00',
      all_day: false,
    });
  });

  it('should update the correct user preferences', async () => {
    vi.mocked(updateUserNotificationsSettings).mockResolvedValue({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    vi.mocked(updateUserDNDSettings).mockResolvedValue({
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const result = await updateUserPreferences(
      '123',
      [{ notification_type: 'email', enabled: false, channels: ['sms'] }],
      [
        {
          id: 'dnd-123',
          name: 'Updated Hours',
          day: 1,
          start_date: '2025-01-01T10:00:00.000Z',
          end_date: '2025-01-01T18:00:00.000Z',
          all_day: false,
        },
      ],
    );

    expect(result).toEqual('User preferences updated successfully');
    expect(updateUserNotificationsSettings).toHaveBeenCalledWith('123', {
      notification_type: 'email',
      enabled: false,
      channels: ['sms'],
    });
    expect(updateUserDNDSettings).toHaveBeenCalledWith('123', {
      id: 'dnd-123',
      name: 'Updated Hours',
      day: 1,
      start_time: '12:00',
      end_time: '12:00',
      all_day: false,
    });
  });

  it('should return a message if the user preferences are empty', async () => {
    const result = await setUserPreferences('123', [], []);

    expect(result).toEqual('No user preferences or DND settings provided');
  });

  it('should return an error if the user preferences fail to set', async () => {
    vi.mocked(setUserNotificationsSettings).mockRejectedValue(new Error('Missing required fields'));
    vi.mocked(setUserDNDSettings).mockRejectedValue(new Error('Missing required fields'));

    await expect(
      setUserPreferences(
        '123',
        // @ts-expect-error - we want to test the error case
        [{ notification_type: 'email', channels: ['email'] }],
        [
          {
            name: 'Work Hours',
            day: 1,
            start_date: '2025-01-01T09:00:00.000Z',
            all_day: false,
          },
        ],
      ),
    ).rejects.toThrow('Failed to set user preferences: Error: Missing required fields');
  });
});
