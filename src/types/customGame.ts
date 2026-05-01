export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD'

export interface CustomGameSettings {
  rounds: number
  municipalities: string[]
  timePerRound: number
  disableMovement: boolean
  difficulty: DifficultyLevel
}

export const CUSTOM_GAMEMODE_NAME = 'Modo personalizado'
export const CUSTOM_GAME_SETTINGS_STORAGE_KEY = 'custom-game-settings'

export const DEFAULT_CUSTOM_GAME_SETTINGS: CustomGameSettings = {
  rounds: 5,
  municipalities: [],
  timePerRound: 180,
  disableMovement: false,
  difficulty: 'NORMAL',
}

export const CUSTOM_DIFFICULTY_OPTIONS = [
  { label: 'Fácil', value: 'EASY' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Difícil', value: 'HARD' },
] satisfies Array<{ label: string; value: DifficultyLevel }>

export function normalizeCustomGameSettings(input?: Partial<CustomGameSettings> | null): CustomGameSettings {
  const difficulty = input?.difficulty
  const normalizedDifficulty: DifficultyLevel =
    difficulty === 'EASY' || difficulty === 'NORMAL' || difficulty === 'HARD'
      ? difficulty
      : DEFAULT_CUSTOM_GAME_SETTINGS.difficulty

  return {
    rounds: Number.isFinite(input?.rounds)
      ? Math.max(1, Math.min(20, Math.round(input.rounds as number)))
      : DEFAULT_CUSTOM_GAME_SETTINGS.rounds,
    municipalities: Array.isArray(input?.municipalities)
      ? input.municipalities.filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
      : [...DEFAULT_CUSTOM_GAME_SETTINGS.municipalities],
    timePerRound: Number.isFinite(input?.timePerRound)
      ? Math.max(30, Math.min(900, Math.round(input.timePerRound as number)))
      : DEFAULT_CUSTOM_GAME_SETTINGS.timePerRound,
    disableMovement: Boolean(input?.disableMovement),
    difficulty: normalizedDifficulty,
  }
}
