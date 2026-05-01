import haversineDistance from "../helpers/haversineDistance.ts";
import { NODE_DIFFICULTY_DISTANCE_THRESHOLDS } from "../config.ts";
import { getDatabase, persistDatabase } from "../services/reflejosDb.ts";

type Difficulty = "EASY" | "NORMAL" | "HARD";

function getDifficulty(
  nodeLat: number,
  nodeLon: number,
  muniLat: number,
  muniLon: number,
): Difficulty {
  const distance = haversineDistance(
    { lat: nodeLat, lng: nodeLon },
    { lat: muniLat, lng: muniLon },
  );

  console.log(
    "DEBUG: Distance from node to municipality center:",
    distance,
    "meters",
  );

  if (distance <= NODE_DIFFICULTY_DISTANCE_THRESHOLDS.EASY) return "EASY";
  if (distance <= NODE_DIFFICULTY_DISTANCE_THRESHOLDS.NORMAL) return "NORMAL";
  return "HARD";
}

function ensureDifficultyColumnExists(db: any) {
  const statement = db.prepare("PRAGMA table_info(geoguessr_node)");
  let hasDifficultyColumn = false;

  try {
    while (statement.step()) {
      const row = statement.getAsObject() as { name?: string };

      if (row.name === "difficulty") {
        hasDifficultyColumn = true;
        break;
      }
    }
  } finally {
    statement.free();
  }

  if (!hasDifficultyColumn) {
    db.run("ALTER TABLE geoguessr_node ADD COLUMN difficulty TEXT");
    console.log("DEBUG: Added difficulty column to geoguessr_node");
    return;
  }

  console.log("DEBUG: difficulty column already exists on geoguessr_node");
}

/**
 * Assigns the difficulty level to each node on the database based on the distance from that node to the center of the municipality.
 *
 * The thresholds live in src/config.ts so the app and scripts use the same difficulty rules.
 */
async function applyDifficultyToNodes() {
  const difficultyFrequency: Record<Difficulty, number> = {
    EASY: 0,
    NORMAL: 0,
    HARD: 0,
  };

  try {
    const db = await getDatabase();
    ensureDifficultyColumnExists(db);

    const selectStatement = db.prepare(
      `SELECT
            node.id as id,
            node.latitude as nodeLat,
            node.longitude as nodeLon,
            m.latitude as muniLat,
            m.longitude as muniLon
        FROM geoguessr_node as node
        JOIN municipality as m ON m.id = node.municipality_id`,
    );
    const updateStatement = db.prepare(
      `UPDATE geoguessr_node
       SET difficulty = ?
       WHERE id = ?`,
    );

    let processedNodes = 0;

    try {
      while (selectStatement.step()) {
        const row = selectStatement.getAsObject() as {
          id: number;
          nodeLat: number;
          nodeLon: number;
          muniLat: number;
          muniLon: number;
        };
        const { id, nodeLat, nodeLon, muniLat, muniLon } = row;
        const difficulty = getDifficulty(nodeLat, nodeLon, muniLat, muniLon);
        difficultyFrequency[difficulty] += 1;
        processedNodes += 1;
        updateStatement.run([difficulty, id]);
        console.log(
          `Difficulty for node ${id} at (${nodeLat}, ${nodeLon}): ${difficulty}`,
        );
      }
    } finally {
      selectStatement.free();
      updateStatement.free();
    }

    await persistDatabase(db); // Save the updated database to disk

    console.log("DEBUG: Total processed nodes:", processedNodes);
    console.log("DEBUG: Difficulty frequency:", difficultyFrequency);
  } catch (error) {
    console.error(error);
  }
}

applyDifficultyToNodes();
