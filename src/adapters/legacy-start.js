import { angleDifference } from '../core/angles.js';
import { bearingDegrees, distanceMeters, KNOTS_TO_METERS_PER_SECOND } from '../core/geo.js';
import { analyzeLine, startTiming, timeToLine } from '../core/start-line.js';

/**
 * Translate the legacy NAV/WIND/CRS/RACE shapes into one tested start solution.
 * This preserves the existing low-speed fallback used while a boat is stopped
 * or when the app is being tested ashore.
 */
export function legacyStartMetrics({
  navigation,
  wind,
  course,
  race,
  target,
  polarSpeedKnots = null,
  nowMs = Date.now(),
}) {
  const position = Number.isFinite(navigation?.lat) && Number.isFinite(navigation?.lon)
    ? { lat: navigation.lat, lon: navigation.lon }
    : null;
  if (!position || !target) return null;

  const distM = distanceMeters(position, target);
  const brgToStart = bearingDegrees(position, target);
  if (!Number.isFinite(distM) || !Number.isFinite(brgToStart)) return null;

  const heading = Number.isFinite(navigation.hdg) ? navigation.hdg : navigation.cog;
  const sog = Number.isFinite(navigation.sog) ? navigation.sog : 0;
  const closingAngle = Number.isFinite(heading) && distM > 0.5
    ? angleDifference(brgToStart, heading)
    : null;
  const closingMS = Number.isFinite(closingAngle)
    ? Math.cos(closingAngle * Math.PI / 180) * sog * KNOTS_TO_METERS_PER_SECOND
    : 0;

  let approachSpd = sog;
  if (approachSpd < 0.8 && Number.isFinite(wind?.twd)) {
    approachSpd = Math.max(2, Number.isFinite(polarSpeedKnots) && polarSpeedKnots > 0 ? polarSpeedKnots : 3.5);
  }
  if (approachSpd < 0.8) approachSpd = 3.5;

  const ttl = closingMS > 0.15
    ? timeToLine({ distanceMeters: distM, speedKnots: sog, closingAngleDegrees: closingAngle })
    : timeToLine({ distanceMeters: distM, speedKnots: approachSpd });
  const gunRem = race?.on && Number.isFinite(race.epoch)
    ? Math.max(0, (race.epoch - nowMs) / 1000)
    : Infinity;
  const timing = Number.isFinite(gunRem) && Number.isFinite(ttl)
    ? startTiming({ secondsRemaining: gunRem, timeToLineSeconds: ttl })
    : null;
  const line = analyzeLine({
    pinA: course?.pinA,
    pinB: course?.pinB,
    trueWindDirection: wind?.twd,
  });
  const steerErr = Number.isFinite(heading) ? angleDifference(brgToStart, heading) : null;

  return {
    target,
    distM,
    ttl,
    burn: timing?.deltaSeconds ?? Infinity,
    timing,
    gunRem,
    brgToStart,
    closingMS,
    approachSpd,
    fav: line?.favoredEnd ?? null,
    bias: line?.biasMeters ?? 0,
    line,
    steerErr,
    approachHdg: brgToStart,
    approachTack: Number.isFinite(wind?.twd)
      ? (angleDifference(brgToStart, wind.twd) > 0 ? 'PORT' : 'STBD')
      : null,
  };
}
