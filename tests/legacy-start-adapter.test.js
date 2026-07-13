import { describe, expect, it } from 'vitest';
import { legacyStartMetrics } from '../src/adapters/legacy-start.js';

const course = {
  pinA: { lat: 33.8422, lon: -78.6103 },
  pinB: { lat: 33.8393, lon: -78.6054 },
};
const target = { lat: 33.84075, lon: -78.60785, label: 'MID' };
const wind = { twd: 210, tws: 12 };
const nowMs = 1_700_000_000_000;

function legacyReference({ navigation, race, polarSpeedKnots }) {
  const toRadians = (value) => value * Math.PI / 180;
  const norm = (value) => ((value % 360) + 360) % 360;
  const diff = (from, to) => {
    const value = norm(to - from);
    return value > 180 ? value - 360 : value;
  };
  const haversine = (a, b) => {
    const radius = 6_371_000;
    const deltaLat = toRadians(b.lat - a.lat);
    const deltaLon = toRadians(b.lon - a.lon);
    const value = Math.sin(deltaLat / 2) ** 2
      + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(deltaLon / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  };
  const bearing = (a, b) => {
    const deltaLon = toRadians(b.lon - a.lon);
    const y = Math.sin(deltaLon) * Math.cos(toRadians(b.lat));
    const x = Math.cos(toRadians(a.lat)) * Math.sin(toRadians(b.lat))
      - Math.sin(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.cos(deltaLon);
    return norm(Math.atan2(y, x) * 180 / Math.PI);
  };
  const position = { lat: navigation.lat, lon: navigation.lon };
  const distM = haversine(position, target);
  const brgToStart = bearing(position, target);
  const heading = navigation.hdg ?? navigation.cog;
  const closingMS = distM > 0.5 && heading !== null
    ? Math.cos(diff(heading, brgToStart) * Math.PI / 180) * (navigation.sog || 0) * 0.514444
    : 0;
  let approachSpd = navigation.sog || 0;
  if (approachSpd < 0.8) approachSpd = Math.max(2, polarSpeedKnots || 3.5);
  if (approachSpd < 0.8) approachSpd = 3.5;
  const ttl = distM / Math.max(0.15, closingMS > 0.15 ? closingMS : approachSpd * 0.514444);
  const gunRem = race.on && race.epoch ? Math.max(0, (race.epoch - nowMs) / 1000) : Infinity;
  return { distM, brgToStart, closingMS, approachSpd, ttl, gunRem, burn: gunRem - ttl };
}

describe('legacy start adapter', () => {
  it.each([
    { navigation: { lat: 33.8388, lon: -78.608, hdg: 350, cog: 351, sog: 5.2 }, race: { on: true, epoch: nowMs + 75_000 }, polarSpeedKnots: 5 },
    { navigation: { lat: 33.8388, lon: -78.608, hdg: 170, cog: 171, sog: 5.2 }, race: { on: true, epoch: nowMs + 20_000 }, polarSpeedKnots: 5 },
    { navigation: { lat: 33.8388, lon: -78.608, hdg: null, cog: null, sog: 0 }, race: { on: false, epoch: null }, polarSpeedKnots: 4.1 },
  ])('preserves characterized timing for %#', ({ navigation, race, polarSpeedKnots }) => {
    const actual = legacyStartMetrics({ navigation, wind, course, race, target, polarSpeedKnots, nowMs });
    const expected = legacyReference({ navigation, race, polarSpeedKnots });
    for (const key of ['distM', 'brgToStart', 'closingMS', 'approachSpd', 'ttl', 'gunRem', 'burn']) {
      if (Number.isFinite(expected[key])) expect(actual[key]).toBeCloseTo(expected[key], 8);
      else expect(actual[key]).toBe(expected[key]);
    }
  });

  it('uses the tested line analysis and timing guidance', () => {
    const result = legacyStartMetrics({
      navigation: { lat: 33.8388, lon: -78.608, hdg: 350, cog: 351, sog: 5.2 },
      wind,
      course,
      race: { on: true, epoch: nowMs + 75_000 },
      target,
      polarSpeedKnots: 5,
      nowMs,
    });
    expect(result.line).toMatchObject({ favoredEnd: result.fav, biasMeters: result.bias });
    expect(['early', 'late', 'on-time']).toContain(result.timing.status);
  });
});
