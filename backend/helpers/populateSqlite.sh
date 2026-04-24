#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(dirname "$(realpath "$0")")"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="${1:-$BACKEND_DIR/data/reflejos.sqlite3}"
COORDS_FILE="$BACKEND_DIR/data/alotofCoords.js"

if [ ! -f "$COORDS_FILE" ]; then
  printf 'Source file not found: %s\n' "$COORDS_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$DB_PATH")"

node - "$COORDS_FILE" <<'EOF' | sqlite3 "$DB_PATH"
const coordsFile = process.argv[2];
const { alotofCoords } = require(coordsFile);

const cities = [
  { cityname: "Calbuco", latitude: -41.7712, longitude: -73.1275 },
  { cityname: "Cochamó", latitude: -41.4942, longitude: -72.3067 },
  { cityname: "Fresia", latitude: -41.1531, longitude: -73.4223 },
  { cityname: "Frutillar", latitude: -41.1258, longitude: -73.0605 },
  { cityname: "Llanquihue", latitude: -41.25, longitude: -73.016666666667 },
  { cityname: "Los Muermos", latitude: -41.4, longitude: -73.483333333333 },
  { cityname: "Maullín", latitude: -41.616666666667, longitude: -73.6 },
  { cityname: "Puerto Montt", latitude: -41.4693, longitude: -72.94237 },
  { cityname: "Puerto Varas", latitude: -41.31946, longitude: -72.98538 },
];

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

console.log("PRAGMA foreign_keys = ON;");
console.log("BEGIN TRANSACTION;");
console.log("DROP TABLE IF EXISTS geoguessr_node;");
console.log("DROP TABLE IF EXISTS municipality;");
console.log(`CREATE TABLE municipality (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL
);`);
console.log(`CREATE TABLE geoguessr_node (
  id INTEGER PRIMARY KEY,
  municipality_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  FOREIGN KEY (municipality_id) REFERENCES municipality(id)
);`);
console.log("CREATE INDEX idx_geoguessr_node_municipality_id ON geoguessr_node(municipality_id);");

for (const city of cities) {
  console.log(
    `INSERT INTO municipality (name, latitude, longitude) VALUES (${sqlString(city.cityname)}, ${city.latitude}, ${city.longitude});`,
  );
}

for (const coord of alotofCoords) {
  console.log(
    `INSERT INTO geoguessr_node (municipality_id, latitude, longitude) VALUES ((SELECT id FROM municipality WHERE name = ${sqlString(coord.cityname)}), ${coord.latitude}, ${coord.longitude});`,
  );
}

console.log("COMMIT;");
EOF

printf 'SQLite database created at %s\n' "$DB_PATH"
