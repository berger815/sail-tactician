import { describe, expect, it } from 'vitest';
import { bearingDegrees, distanceMeters } from '../src/core/geo.js';

describe('geodesy', () => {
  const origin = { lat: 33.84, lon: -78.61 };
  it('returns zero distance to the same point', () => expect(distanceMeters(origin, origin)).toBe(0));
  it('calculates cardinal bearings', () => {
    expect(bearingDegrees(origin, { lat: 33.85, lon: -78.61 })).toBeCloseTo(0, 4);
    expect(bearingDegrees(origin, { lat: 33.84, lon: -78.60 })).toBeCloseTo(90, 1);
  });
});
