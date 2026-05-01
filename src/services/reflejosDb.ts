import initSqlJs from "sql.js";
import type { DifficultyLevel } from "@/types/customGame";

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

interface NodeFilters {
  municipalities?: string[];
  difficulty?: DifficultyLevel | null;
}

function buildNodeWhereClause(
  usedNodeIds: number[],
  filters: NodeFilters = {},
) {
  const clauses: string[] = [];
  const params: Array<number | string> = [];

  if (usedNodeIds.length) {
    clauses.push(
      `geoguessr_node.id NOT IN (${usedNodeIds.map(() => "?").join(", ")})`,
    );
    params.push(...usedNodeIds);
  }

  if (filters.municipalities?.length) {
    clauses.push(
      `municipality.name IN (${filters.municipalities.map(() => "?").join(", ")})`,
    );
    params.push(...filters.municipalities);
  }

  if (filters.difficulty) {
    clauses.push("geoguessr_node.difficulty = ?");
    params.push(filters.difficulty);
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

/**
 * Reads one random node from the in-memory SQLite DB, excluding ids already used in the current game.
 */
function readRandomNode(
  db: any,
  usedNodeIds: number[] = [],
  filters: NodeFilters = {},
) {
  const validUsedNodeIds = usedNodeIds.filter((id) => Number.isInteger(id));
  const normalizedMunicipalities =
    filters.municipalities?.filter(
      (name) => typeof name === "string" && name.trim().length > 0,
    ) ?? [];
  const { whereClause, params } = buildNodeWhereClause(validUsedNodeIds, {
    municipalities: normalizedMunicipalities,
    difficulty: filters.difficulty ?? null,
  });
  const statement = db.prepare(`
    SELECT geoguessr_node.id, municipality.name, geoguessr_node.latitude, geoguessr_node.longitude
    FROM geoguessr_node
    INNER JOIN municipality ON municipality.id = geoguessr_node.municipality_id
    ${whereClause}
    ORDER BY RANDOM()
    LIMIT 1
  `);

  try {
    if (params.length) {
      statement.bind(params);
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

export async function getRandomNode(
  usedNodeIds: number[] = [],
  difficulty?: DifficultyLevel,
) {
  const db = await getDatabase();
  const node =
    readRandomNode(db, usedNodeIds, { difficulty }) ||
    readRandomNode(db, [], { difficulty });

  if (!node) {
    throw new Error("No hay nodos disponibles en la base de datos local");
  }

  return node;
}

export async function getFilteredRandomNode(
  usedNodeIds: number[] = [],
  filters: NodeFilters = {},
) {
  const db = await getDatabase();
  const node =
    readRandomNode(db, usedNodeIds, filters) || readRandomNode(db, [], filters);

  if (!node) {
    throw new Error(
      "No hay nodos disponibles para la configuracion seleccionada",
    );
  }

  return node;
}

export async function getMunicipalities() {
  const db = await getDatabase();
  const statement = db.prepare(`
    SELECT name
    FROM municipality
    ORDER BY name ASC
  `);

  try {
    const municipalities: string[] = [];

    while (statement.step()) {
      const row = statement.getAsObject() as { name: string };
      municipalities.push(row.name);
    }

    return municipalities;
  } finally {
    statement.free();
  }
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
  const databaseFilePath = path.resolve(
    currentDir,
    "../../public/reflejos.sqlite3",
  );
  const exportedDatabase = db.export();

  await writeFile(databaseFilePath, exportedDatabase);
  console.log(`DEBUG: Saved updated database to ${databaseFilePath}`);
}
