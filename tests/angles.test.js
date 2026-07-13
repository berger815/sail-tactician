import { describe, expect, it } from 'vitest';
import { angleDifference, circularMean, normalizeAngle } from '../src/core/angles.js';

describe('angle utilities', () => {
  it('normalizes across north', () => {
    expect(normalizeAngle(361)).toBe(1);
    expect(normalizeAngle(-1)).toBe(359);
  });
  it('returns the shortest signed turn', () => {
    expect(angleDifference(10, 350)).toBe(20);
    expect(angleDifference(350, 10)).toBe(-20);
  });
  it('takes a circular mean around north', () => {
    expect(circularMean([350, 10])).toBeCloseTo(0, 8);
  });
});
