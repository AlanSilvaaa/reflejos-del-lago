const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

type Coordinates = {
  lat: number;
  lng: number;
};

/**
 * Calculates the Haversine distance between two geographic coordinates.
 *
 * @param from - The starting coordinates (latitude and longitude).
 * @param to - The ending coordinates (latitude and longitude).
 * @returns The distance in meters between the two points.
 */
export default function haversineDistance(
  from: Coordinates,
  to: Coordinates,
): number {
  const earthRadius = 6371000; // Meters
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
