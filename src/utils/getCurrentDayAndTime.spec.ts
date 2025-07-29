import { describe, it, expect, vi } from 'vitest';
import { getCurrentDayAndTime } from './getCurrentDayAndTime';

describe('getCurrentDayAndTime', () => {
  it('should return the correct day and time', () => {
    vi.useFakeTimers().setSystemTime(new Date('2025-01-01T12:00:00Z'));
    const result = getCurrentDayAndTime();
    expect(result.currentDay).toMatchInlineSnapshot(`3`);
    expect(result.currentTime).toMatchInlineSnapshot(`"12:00"`);
    vi.useRealTimers();
  });
});
