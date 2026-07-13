import { angleDifference } from './angles.js';
import { bearingDegrees, distanceMeters, KNOTS_TO_METERS_PER_SECOND, localMeters, midpoint } from './geo.js';

export function analyzeLine({ pinA, pinB, trueWindDirection }) {
  const lengthMeters = distanceMeters(pinA, pinB);
  if (!Number.isFinite(lengthMeters) || lengthMeters < 2 || !Number.isFinite(trueWindDirection)) return null;
  const lineBearing = bearingDegrees(pinA, pinB);
  const line = localMeters(pinA, pinB);
  const radians = trueWindDirection * Math.PI / 180;
  const upwind = { east: Math.sin(radians), north: Math.cos(radians) };
  const projectionB = line.east * upwind.east + line.north * upwind.north;
  const biasMeters = Math.abs(projectionB);
  return {
    lengthMeters,
    lineBearing,
    squareErrorDegrees: Math.abs(angleDifference(lineBearing + 90, trueWindDirection)),
    favoredEnd: biasMeters < 0.01 ? 'even' : projectionB > 0 ? 'B' : 'A',
    biasMeters,
    midpoint: midpoint(pinA, pinB),
  };
}

export function timeToLine({ distanceMeters: distance, speedKnots, closingAngleDegrees = 0 }) {
  if (!Number.isFinite(distance) || distance < 0 || !Number.isFinite(speedKnots) || speedKnots <= 0) return null;
  const closingSpeed = speedKnots * KNOTS_TO_METERS_PER_SECOND
    * Math.max(0, Math.cos(closingAngleDegrees * Math.PI / 180));
  return closingSpeed > 0.01 ? distance / closingSpeed : null;
}

export function startTiming({ secondsRemaining, timeToLineSeconds }) {
  if (!Number.isFinite(secondsRemaining) || !Number.isFinite(timeToLineSeconds)) return null;
  const deltaSeconds = secondsRemaining - timeToLineSeconds;
  return {
    deltaSeconds,
    status: Math.abs(deltaSeconds) <= 2 ? 'on-time' : deltaSeconds > 2 ? 'early' : 'late',
    instruction: Math.abs(deltaSeconds) <= 2
      ? 'HOLD'
      : deltaSeconds > 2 ? `BURN ${Math.round(deltaSeconds)}s` : `GAIN ${Math.abs(Math.round(deltaSeconds))}s`,
  };
}
