import initSqlJs from "sql.js";

let dbPromise;
const SQLITE_DB_VERSION = "2026-04-24-schema-rename";

async function loadDatabase() {
  const SQL = await initSqlJs({
    locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm`,
  });

  const response = await fetch(
    `${import.meta.env.BASE_URL}reflejos.sqlite3?v=${SQLITE_DB_VERSION}`,
  );

  if (!response.ok) {
    throw new Error(`No se pudo cargar reflejos.sqlite3: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return new SQL.Database(new Uint8Array(buffer));
}

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = loadDatabase();
  }

  return dbPromise;
}

/**
 * Reads one random node from the in-memory SQLite DB, excluding ids already used in the current game.
 */
function readRandomNode(db, usedNodeIds = []) {
  const validUsedNodeIds = usedNodeIds.filter((id) => Number.isInteger(id));
  const placeholders = validUsedNodeIds.map(() => "?").join(", ");
  const whereClause = validUsedNodeIds.length
    ? `WHERE geoguessr_node.id NOT IN (${placeholders})`
    : "";
  const statement = db.prepare(`
    SELECT geoguessr_node.id, municipality.name, geoguessr_node.latitude, geoguessr_node.longitude
    FROM geoguessr_node
    INNER JOIN municipality ON municipality.id = geoguessr_node.municipality_id
    ${whereClause}
    ORDER BY RANDOM()
    LIMIT 1
  `);

  try {
    if (validUsedNodeIds.length) {
      statement.bind(validUsedNodeIds);
    }

    if (!statement.step()) {
      return null;
    }

    const row = statement.getAsObject();

    return {
      id: row.id,
      municipality: row.name,
      lat: row.latitude,
      lng: row.longitude,
    };
  } finally {
    statement.free();
  }
}

export async function getRandomNode(usedNodeIds = []) {
  const db = await getDatabase();
  const node = readRandomNode(db, usedNodeIds) || readRandomNode(db);

  if (!node) {
    throw new Error("No hay nodos disponibles en la base de datos local");
  }

  return node;
}
