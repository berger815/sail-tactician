/** Normalize an angle to the interval [0, 360). */
export function normalizeAngle(degrees) {
  if (!Number.isFinite(degrees)) return null;
  return ((degrees % 360) + 360) % 360;
}

/** Smallest signed turn from `from` to `to`, in [-180, 180). */
export function angleDifference(to, from) {
  const a = normalizeAngle(to);
  const b = normalizeAngle(from);
  if (a === null || b === null) return null;
  return ((a - b + 540) % 360) - 180;
}

export function absoluteAngleDifference(a, b) {
  const difference = angleDifference(a, b);
  return difference === null ? null : Math.abs(difference);
}

/** Circular mean; useful for wind direction samples around north. */
export function circularMean(degrees) {
  const values = degrees.filter(Number.isFinite);
  if (!values.length) return null;
  const sum = values.reduce(
    (acc, value) => {
      const radians = value * Math.PI / 180;
      acc.sin += Math.sin(radians);
      acc.cos += Math.cos(radians);
      return acc;
    },
    { sin: 0, cos: 0 },
  );
  if (Math.abs(sum.sin) < 1e-12 && Math.abs(sum.cos) < 1e-12) return null;
  return normalizeAngle(Math.atan2(sum.sin, sum.cos) * 180 / Math.PI);
}
