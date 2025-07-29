import { describe, it, expect } from 'vitest';
import { convertTimeToHoursAndMinutes } from './convertTimeToHoursAndMinutes';

describe('convertTimeToHoursAndMinutes', () => {
  it('should return the correct hours and minutes', () => {
    const result = convertTimeToHoursAndMinutes('2025-01-01T12:00:00Z');
    expect(result).toBe('12:00');
  });

  it('should return the correct hours and minutes format for a single digit hour and minute', () => {
    const result = convertTimeToHoursAndMinutes('2025-01-01T01:01:00Z');
    expect(result).toBe('01:01');
  });

  it('should return undefined if the time is not provided', () => {
    const result = convertTimeToHoursAndMinutes(undefined);
    expect(result).toBeUndefined();
  });
});
