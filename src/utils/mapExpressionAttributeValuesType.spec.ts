import { describe, it, expect } from 'vitest';
import { mapExpressionAttributeValuesType } from './mapExpressionAttributeValuesType';

describe('mapExpressionAttributeValuesType', () => {
  it('should return the correct type for a string', () => {
    const result = mapExpressionAttributeValuesType('test');
    expect(result).toBe('S');
  });

  it('should return the correct type for a number', () => {
    const result = mapExpressionAttributeValuesType(1);
    expect(result).toBe('N');
  });

  it('should return the correct type for a boolean', () => {
    const result = mapExpressionAttributeValuesType(true);
    expect(result).toBe('BOOL');
  });

  it('should return the correct type for an array of strings', () => {
    const result = mapExpressionAttributeValuesType(['test', 'test2']);
    expect(result).toBe('SS');
  });

  it('should return the correct type for an array of numbers', () => {
    const result = mapExpressionAttributeValuesType([1, 2]);
    expect(result).toBe('NS');
  });
});
