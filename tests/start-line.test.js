import { describe, expect, it } from 'vitest';
import { analyzeLine, startTiming, timeToLine } from '../src/core/start-line.js';

describe('start line', () => {
  it('identifies a nearly square east-west line', () => {
    const result = analyzeLine({
      pinA: { lat: 33.84, lon: -78.61 },
      pinB: { lat: 33.84, lon: -78.60 },
      trueWindDirection: 180,
    });
    expect(result.lengthMeters).toBeGreaterThan(900);
    expect(result.squareErrorDegrees).toBeLessThan(1);
    expect(result.favoredEnd).toBe('even');
  });
  it('calculates timing guidance', () => {
    const ttl = timeToLine({ distanceMeters: 51.4444, speedKnots: 10 });
    expect(ttl).toBeCloseTo(10, 3);
    expect(startTiming({ secondsRemaining: 18, timeToLineSeconds: ttl })).toMatchObject({ status: 'early', instruction: 'BURN 8s' });
  });
});
