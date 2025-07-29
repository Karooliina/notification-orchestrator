import { describe, it, expect, beforeAll, vi } from 'vitest';
import { buildUpdateExpression } from './buildUpdateExpression';

describe('buildUpdateExpression', () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
  });

  it('should return the correct update expression for a string and a number', () => {
    const result = buildUpdateExpression({ name: 'test', age: 20 });

    expect(result.updateExpression).toBe('SET #updatedAt = :updatedAt, #name = :name, #age = :age');
    expect(result.expressionAttributeNames).toEqual({ '#name': 'name', '#age': 'age', '#updatedAt': 'updatedAt' });
    expect(result.expressionAttributeValues).toEqual({
      ':name': { S: 'test' },
      ':age': { N: '20' },
      ':updatedAt': { S: '2025-01-01T12:00:00.000Z' },
    });
  });

  it('should return the correct update expression for a boolean', () => {
    const result = buildUpdateExpression({ isActive: true });
    expect(result.updateExpression).toBe('SET #updatedAt = :updatedAt, #isActive = :isActive');
    expect(result.expressionAttributeNames).toEqual({ '#isActive': 'isActive', '#updatedAt': 'updatedAt' });
    expect(result.expressionAttributeValues).toEqual({
      ':isActive': { BOOL: true },
      ':updatedAt': { S: '2025-01-01T12:00:00.000Z' },
    });
  });

  it('should return the correct update expression for an array of strings', () => {
    const result = buildUpdateExpression({ tags: ['tag1', 'tag2'] });
    expect(result.updateExpression).toBe('SET #updatedAt = :updatedAt, #tags = :tags');
    expect(result.expressionAttributeNames).toEqual({
      '#tags': 'tags',
      '#updatedAt': 'updatedAt',
    });
    expect(result.expressionAttributeValues).toEqual({
      ':updatedAt': { S: '2025-01-01T12:00:00.000Z' },
      ':tags': { SS: ['tag1', 'tag2'] },
    });
  });

  it('should return the correct update expression for an array of numbers', () => {
    const result = buildUpdateExpression({ tags: [1, 2] });
    expect(result.updateExpression).toBe('SET #updatedAt = :updatedAt, #tags = :tags');
    expect(result.expressionAttributeNames).toEqual({
      '#tags': 'tags',
      '#updatedAt': 'updatedAt',
    });
    expect(result.expressionAttributeValues).toEqual({
      ':updatedAt': { S: '2025-01-01T12:00:00.000Z' },
      ':tags': { NS: ['1', '2'] },
    });
  });
});
