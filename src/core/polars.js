const sortedNumericKeys = (object) => Object.keys(object).map(Number).sort((a, b) => a - b);

function bracket(values, target) {
  if (target <= values[0]) return [values[0], values[0]];
  if (target >= values.at(-1)) return [values.at(-1), values.at(-1)];
  const upperIndex = values.findIndex((value) => value >= target);
  return [values[upperIndex - 1], values[upperIndex]];
}

function interpolate(a, b, fraction) {
  return a + (b - a) * fraction;
}

function interpolateRow(row, twa) {
  const angles = sortedNumericKeys(row);
  const [lower, upper] = bracket(angles, twa);
  if (lower === upper) return Number(row[lower]);
  return interpolate(Number(row[lower]), Number(row[upper]), (twa - lower) / (upper - lower));
}

/**
 * Bilinear polar interpolation.
 * Shape: { 6: { 45: 4.1, 60: 4.8 }, 10: { 45: 5.2, 60: 6.0 } }
 */
export function polarSpeed(polar, trueWindSpeed, trueWindAngle) {
  if (!polar || !Number.isFinite(trueWindSpeed) || !Number.isFinite(trueWindAngle)) return null;
  const speeds = sortedNumericKeys(polar);
  if (!speeds.length) return null;
  const twa = Math.max(0, Math.min(180, Math.abs(trueWindAngle)));
  const [lower, upper] = bracket(speeds, trueWindSpeed);
  const lowerSpeed = interpolateRow(polar[lower], twa);
  if (lower === upper) return lowerSpeed;
  const upperSpeed = interpolateRow(polar[upper], twa);
  return interpolate(lowerSpeed, upperSpeed, (trueWindSpeed - lower) / (upper - lower));
}

export function performancePercent(actualSpeed, targetSpeed) {
  if (!Number.isFinite(actualSpeed) || !Number.isFinite(targetSpeed) || targetSpeed <= 0) return null;
  return actualSpeed / targetSpeed * 100;
}
