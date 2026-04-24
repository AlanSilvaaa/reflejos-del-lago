import haversineDistance from "./haversineDistance.ts";
import { getDatabase } from "../services/reflejosDb.ts";

const EASY = 1000;
const NORMAL = 5000;
// HARD is any distance greater than NORMAl

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

  if (distance <= EASY) return "EASY";
  if (distance <= NORMAL) return "NORMAL";
  return "HARD";
}

/**
 * Assigns the difficulty level to each node on the database based on the distance from that node to the center of the municipality.
 *
 * The difficulty can be EASY, NORMAL or HARD, and the distance thresholds are defined as follows:
 * - EASY: distance <= 1000 meters
 * - NORMAL: 1000 meters < distance <= 5000 meters
 * - HARD: any distance over NORMAL
 */
async function applyDifficultyToNodes() {
  const difficulties: Difficulty[] = [];
  const difficultyFrequency: Record<Difficulty, number> = {
    EASY: 0,
    NORMAL: 0,
    HARD: 0,
  };

  try {
    const db = await getDatabase();
    const statement = db.prepare(
      `SELECT
            node.latitude as nodeLat,
            node.longitude as nodeLon,
            m.latitude as muniLat,
            m.longitude as muniLon
        FROM geoguessr_node as node
        JOIN municipality as m ON m.id = node.municipality_id`,
    );
    try {
      while (statement.step()) {
        const row = statement.getAsObject();
        const { nodeLat, nodeLon, muniLat, muniLon } = row;
        console.log(row);
        const difficulty = getDifficulty(nodeLat, nodeLon, muniLat, muniLon);
        difficulties.push(difficulty);
        difficultyFrequency[difficulty] += 1;
        console.log(
          `Difficulty for node at (${nodeLat}, ${nodeLon}): ${difficulty}`,
        );
      }
    } finally {
      statement.free();
    }

    console.log("DEBUG: Total processed nodes:", difficulties.length);
    console.log("DEBUG: Difficulty frequency:", difficultyFrequency);
  } catch (error) {
    console.error(error);
  }
}

applyDifficultyToNodes();
