import { Coordinates } from '../types';

/**
 * Earth's radius in meters
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLatRad = toRadians(coord2.latitude - coord1.latitude);
  const deltaLonRad = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate the initial bearing from one coordinate to another
 * @param from Starting coordinate
 * @param to Destination coordinate
 * @returns Bearing in degrees (0-360, where 0 is North)
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const lat1Rad = toRadians(from.latitude);
  const lat2Rad = toRadians(to.latitude);
  const deltaLonRad = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

  const bearingRad = Math.atan2(y, x);
  const bearingDeg = toDegrees(bearingRad);

  // Normalize to 0-360
  return (bearingDeg + 360) % 360;
}

/**
 * Format distance for display with km + meters for precise tracking
 * @param meters Distance in meters
 * @returns Formatted string with km and meters
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    // Under 1km, show only meters
    return `${Math.round(meters)}m`;
  } else {
    // Over 1km, show km + meters
    const km = Math.floor(meters / 1000);
    const remainingMeters = Math.round(meters % 1000);
    return `${km}km ${remainingMeters}m`;
  }
}

/**
 * Format distance - simple version (for comparison)
 * @param meters Distance in meters
 * @returns Formatted string
 */
export function formatDistanceSimple(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else if (meters < 10000) {
    return `${(meters / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(meters / 1000)}km`;
  }
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Calculate the shortest angular difference between two bearings
 * Returns a value between -180 and 180
 */
export function angleDifference(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}
