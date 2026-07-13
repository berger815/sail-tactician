import { describe, expect, it } from 'vitest';
import { recommendationConfidence } from '../src/core/confidence.js';

describe('recommendation confidence', () => {
  it('marks manual inputs as estimated', () => {
    expect(recommendationConfidence({ gpsAccuracyMeters: 5, windAgeSeconds: 20 }).level).toBe('estimated');
  });
  it('rejects missing critical inputs', () => {
    expect(recommendationConfidence({ gpsAccuracyMeters: 5 }).level).toBe('unavailable');
  });
  it('accepts current instrument data', () => {
    expect(recommendationConfidence({
      gpsAccuracyMeters: 4,
      windAgeSeconds: 10,
      headingAgeSeconds: 1,
      windSource: 'nmea',
      polarSource: 'measured',
    }).level).toBe('good');
  });
});
