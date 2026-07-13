import { normalizeAngle } from './angles.js';

export const EARTH_RADIUS_METERS = 6_371_000;
export const METERS_PER_NAUTICAL_MILE = 1852;
export const KNOTS_TO_METERS_PER_SECOND = 0.514444;

const radians = (degrees) => degrees * Math.PI / 180;

export function isCoordinate(point) {
  return Boolean(point)
    && Number.isFinite(point.lat)
    && Number.isFinite(point.lon)
    && Math.abs(point.lat) <= 90
    && Math.abs(point.lon) <= 180;
}

export function distanceMeters(from, to) {
  if (!isCoordinate(from) || !isCoordinate(to)) return null;
  const lat1 = radians(from.lat);
  const lat2 = radians(to.lat);
  const deltaLat = radians(to.lat - from.lat);
  const deltaLon = radians(to.lon - from.lon);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingDegrees(from, to) {
  if (!isCoordinate(from) || !isCoordinate(to)) return null;
  const lat1 = radians(from.lat);
  const lat2 = radians(to.lat);
  const deltaLon = radians(to.lon - from.lon);
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2)
    - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  return normalizeAngle(Math.atan2(y, x) * 180 / Math.PI);
}

/** Local east/north coordinates in meters, suitable for race-course distances. */
export function localMeters(origin, point) {
  if (!isCoordinate(origin) || !isCoordinate(point)) return null;
  const meanLatitude = radians((origin.lat + point.lat) / 2);
  return {
    east: radians(point.lon - origin.lon) * EARTH_RADIUS_METERS * Math.cos(meanLatitude),
    north: radians(point.lat - origin.lat) * EARTH_RADIUS_METERS,
  };
}

export function midpoint(a, b) {
  if (!isCoordinate(a) || !isCoordinate(b)) return null;
  return { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 };
}
