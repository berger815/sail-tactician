const LEVELS = ['unavailable', 'low', 'estimated', 'good'];

export function recommendationConfidence({
  gpsAccuracyMeters,
  windAgeSeconds,
  headingAgeSeconds,
  windSource = 'manual',
  polarSource = 'estimated',
} = {}) {
  const reasons = [];
  if (!Number.isFinite(gpsAccuracyMeters)) reasons.push('GPS unavailable');
  else if (gpsAccuracyMeters > 25) reasons.push('GPS accuracy is poor');
  if (!Number.isFinite(windAgeSeconds)) reasons.push('Wind unavailable');
  else if (windAgeSeconds > 300) reasons.push('Wind is stale');
  if (Number.isFinite(headingAgeSeconds) && headingAgeSeconds > 10) reasons.push('Heading is stale');

  let level = 'good';
  if (!Number.isFinite(gpsAccuracyMeters) || !Number.isFinite(windAgeSeconds)) level = 'unavailable';
  else if (gpsAccuracyMeters > 25 || windAgeSeconds > 300) level = 'low';
  else if (gpsAccuracyMeters > 10 || windAgeSeconds > 90 || windSource === 'manual' || polarSource === 'estimated') level = 'estimated';

  return { level, rank: LEVELS.indexOf(level), reasons };
}
