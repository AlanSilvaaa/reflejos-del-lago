import ProvinciaDeLlanquihue from "@/data/boundaries/ProvinciaDeLlanquihue.json";

type Coordinates = {
  lat: number;
  lng: number;
};

type Ring = Coordinates[];

type ProvinceOutline = {
  paths: Ring;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
  clickable: boolean;
};

type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const provinceBoundary = ProvinciaDeLlanquihue as Ring[];

export const PROVINCE_MINIMAP_CENTER: Coordinates = {
  lat: -41.333333333333,
  lng: -72.833333333333,
};
export const PROVINCE_MIN_ZOOM = 7;

/**
 * Builds the visible province outline used by both maps to show the playable area.
 */
export const provinceOutline: ProvinceOutline[] = provinceBoundary.map(
  (ring) => ({
    paths: ring,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0,
    clickable: false,
  }),
);

/**
 * Checks whether a coordinate falls inside a single polygon ring.
 *
 * This is used as the low-level geometry test behind click validation.
 */
export function isPointInsideRing(point: Coordinates, ring: Ring): boolean {
  let isInside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const current = ring[i];
    const previous = ring[j];
    const intersects =
      current.lat > point.lat !== previous.lat > point.lat &&
      point.lng <
        ((previous.lng - current.lng) * (point.lat - current.lat)) /
          (previous.lat - current.lat) +
          current.lng;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

/**
 * Checks whether a coordinate is inside the province boundary.
 *
 * This is used to reject minimap guesses placed outside the allowed area.
 */
export function isWithinProvinceBoundary(position: Coordinates): boolean {
  return provinceBoundary.some((ring) => isPointInsideRing(position, ring));
}

/**
 * Builds the padded outer rectangle around the province.
 *
 * This outer ring acts as the frame for the red mask and as the area limit for map movement.
 */
export function buildProvinceMaskOuterRing(): Ring {
  const points = provinceBoundary.flat();
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);
  const padding = 1.5;
  const north = Math.max(...latitudes) + padding;
  const south = Math.min(...latitudes) - padding;
  const east = Math.max(...longitudes) + padding;
  const west = Math.min(...longitudes) - padding;

  return [
    { lat: north, lng: west },
    { lat: south, lng: west },
    { lat: south, lng: east },
    { lat: north, lng: east },
  ];
}

/**
 * Converts the outer province frame into Google Maps bounds.
 *
 * The bounds are reused to keep both maps visually contained inside the same square area.
 */
export function buildProvinceMapBounds(): MapBounds {
  const outerRing = buildProvinceMaskOuterRing();

  return {
    north: outerRing[0].lat,
    south: outerRing[1].lat,
    east: outerRing[2].lng,
    west: outerRing[0].lng,
  };
}

/**
 * Locks a Google map to the province framing area.
 *
 * It prevents zooming too far out and blocks panning outside the square that preserves the map illusion.
 */
export function applyProvinceMapRestriction(
  map: google.maps.Map,
  minZoom = PROVINCE_MIN_ZOOM,
): void {
  map.setOptions({
    minZoom,
    restriction: {
      latLngBounds: buildProvinceMapBounds(),
      strictBounds: true,
    },
  });
}

/**
 * Draws the dimmed red overlay outside the province.
 *
 * The polygon uses the padded outer ring as the exterior shape and the reversed province boundary as a hole,
 * so the playable area stays clear while the outside area is visually muted.
 */
export function drawProvinceBoundaryMask(
  map: google.maps.Map,
  currentMask: google.maps.Polygon | null = null,
): google.maps.Polygon | null {
  const Polygon = window.google?.maps?.Polygon;

  if (typeof Polygon !== "function") {
    return currentMask;
  }

  currentMask?.setMap(null);

  return new Polygon({
    paths: [
      buildProvinceMaskOuterRing(),
      ...provinceBoundary.map((ring) => [...ring].reverse()),
    ],
    strokeOpacity: 0,
    fillColor: "#7f1d1d",
    fillOpacity: 0.28,
    clickable: false,
    map,
  });
}
