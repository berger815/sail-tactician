import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { angleDifference, bearingDegrees, distanceMeters, localMeters, midpoint, normalizeAngle } from '../src/index.js';

const source = readFileSync(new URL('../src/generated/tactician-core.js', import.meta.url), 'utf8');
const context = {};
vm.runInNewContext(source, context);
const browserCore = context.TacticianCore;

const racePoints = [
  [{ lat: 33.8422, lon: -78.6103 }, { lat: 33.8393, lon: -78.6054 }],
  [{ lat: 33.8000, lon: -78.7200 }, { lat: 33.7800, lon: -78.6500 }],
  [{ lat: 0, lon: 179.99 }, { lat: 0, lon: -179.99 }],
];

describe('legacy geometry integration', () => {
  it('publishes the tested core as a classic browser global', () => {
    expect(browserCore).toBeTruthy();
    expect(browserCore.normalizeAngle(-1)).toBe(359);
    expect(browserCore.legacyStartMetrics).toBeTypeOf('function');
  });

  it('preserves the legacy signed angle convention', () => {
    const legacyAngDiff = (a, b) => browserCore.angleDifference(b, a);
    expect(legacyAngDiff(350, 10)).toBe(20);
    expect(legacyAngDiff(10, 350)).toBe(-20);
    expect(legacyAngDiff(0, 180)).toBe(-180);
  });

  it.each(racePoints)('matches source geodesy for %#', (from, to) => {
    expect(browserCore.distanceMeters(from, to)).toBeCloseTo(distanceMeters(from, to), 8);
    expect(browserCore.bearingDegrees(from, to)).toBeCloseTo(bearingDegrees(from, to), 8);
    expect(browserCore.localMeters(from, to)).toEqual(localMeters(from, to));
    expect(browserCore.midpoint(from, to)).toEqual(midpoint(from, to));
  });

  it('matches source angle normalization across a broad range', () => {
    for (let value = -1080; value <= 1080; value += 7.5) {
      expect(browserCore.normalizeAngle(value)).toBe(normalizeAngle(value));
      expect(browserCore.angleDifference(value, 17)).toBe(angleDifference(value, 17));
    }
  });
});
