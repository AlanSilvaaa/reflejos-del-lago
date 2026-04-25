import initSqlJs from "sql.js";

let dbPromise: Promise<any> | undefined;
const SQLITE_DB_VERSION = "2026-04-24-schema-rename";

function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

async function loadDatabase() {
  if (isBrowserEnvironment()) {
    const baseUrl = import.meta.env?.BASE_URL ?? "/";
    const SQL = await initSqlJs({
      locateFile: () => `${baseUrl}sql-wasm.wasm`,
    });

    const response = await fetch(
      `${baseUrl}reflejos.sqlite3?v=${SQLITE_DB_VERSION}`,
    );

    if (!response.ok) {
      throw new Error(`No se pudo cargar reflejos.sqlite3: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return new SQL.Database(new Uint8Array(buffer));
  }

  const [{ readFile }, { fileURLToPath }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:url"),
    import("node:path"),
  ]);

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const projectRoot = path.resolve(currentDir, "../..");
  const publicDir = path.join(projectRoot, "public");
  const wasmPath = path.join(
    projectRoot,
    "node_modules",
    "sql.js",
    "dist",
    "sql-wasm.wasm",
  );
  const databasePath = path.join(publicDir, "reflejos.sqlite3");
  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });
  const buffer = await readFile(databasePath);

  return new SQL.Database(new Uint8Array(buffer));
}

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = loadDatabase();
  }

  return dbPromise;
}

/**
 * Reads one random node from the in-memory SQLite DB, excluding ids already used in the current game.
 */
function readRandomNode(db: any, usedNodeIds: number[] = []) {
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

    const row = statement.getAsObject() as {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
    };

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

export async function getRandomNode(usedNodeIds: number[] = []) {
  const db = await getDatabase();
  const node = readRandomNode(db, usedNodeIds) || readRandomNode(db);

  if (!node) {
    throw new Error("No hay nodos disponibles en la base de datos local");
  }

  return node;
}

export async function persistDatabase(db: any) {
  if (isBrowserEnvironment()) {
    throw new Error("persistDatabase can only be used in Node");
  }

  const [{ writeFile }, path, { fileURLToPath }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
    import("node:url"),
  ]);

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const databaseFilePath = path.resolve(currentDir, "../../public/reflejos.sqlite3");
  const exportedDatabase = db.export();

  await writeFile(databaseFilePath, exportedDatabase);
  console.log(`DEBUG: Saved updated database to ${databaseFilePath}`);
}
