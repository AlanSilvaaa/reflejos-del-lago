import type { DifficultyLevel } from "@/types/customGame";

export const RANDOM_NODE_DIFFICULTY_DISTRIBUTION: Record<
  DifficultyLevel,
  number
> = {
  EASY: 0.35,
  NORMAL: 0.45,
  HARD: 0.2,
};

export const RANDOM_NODE_DIFFICULTY_ORDER: DifficultyLevel[] = [
  "EASY",
  "NORMAL",
  "HARD",
];

export const NODE_DIFFICULTY_DISTANCE_THRESHOLDS = {
  EASY: 1000,
  NORMAL: 5000,
} as const;
