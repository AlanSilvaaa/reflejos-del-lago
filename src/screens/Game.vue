<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRoute, useRouter } from 'vue-router'
import { RANDOM_NODE_DIFFICULTY_DISTRIBUTION, RANDOM_NODE_DIFFICULTY_ORDER } from '@/config'
import PlayGame from '@/screens/PlayGame.vue'
import ResultsScreen from '@/screens/ResultsScreen.vue'
import haversineDistance from '@/helpers/haversineDistance.ts'
import { getFilteredRandomNode, getRandomNode } from '@/services/reflejosDb'
import {
  CUSTOM_GAME_SETTINGS_STORAGE_KEY,
  CUSTOM_GAMEMODE_NAME,
  DEFAULT_CUSTOM_GAME_SETTINGS,
  normalizeCustomGameSettings,
} from '@/types/customGame'

defineOptions({
  name: 'GameScreen',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const DEFAULT_GAMEMODE = 'Modo normal'
const MAX_ROUNDS = 3
const DEFAULT_ROUND_DURATION = 180
const MAX_SCORE = 5000
const SCORE_THRESHOLD = 50
const SCORE_DECAY = 0.0005
const SESSION_STORAGE_KEY = 'game-session'

function getRandomDifficulty() {
  const randomValue = Math.random()
  let cumulativeProbability = 0

  for (const difficulty of RANDOM_NODE_DIFFICULTY_ORDER) {
    cumulativeProbability += RANDOM_NODE_DIFFICULTY_DISTRIBUTION[difficulty]

    if (randomValue < cumulativeProbability) {
      return difficulty
    }
  }

  return RANDOM_NODE_DIFFICULTY_ORDER[RANDOM_NODE_DIFFICULTY_ORDER.length - 1]
}

const gamemode = ref(DEFAULT_GAMEMODE)
const customSettings = ref({ ...DEFAULT_CUSTOM_GAME_SETTINGS })
const round = ref(1)
const usedNodeIds = ref([])
const initialCoord = ref(null)
const realCoord = ref({ lat: 0, lng: 0 })
const guessCoord = ref(null)
const score = ref(0)
const meters = ref(0)
const showResults = ref(false)
const countdown = ref(DEFAULT_ROUND_DURATION)
const timeExpired = ref(false)
const roundDeadline = ref(null)
let countdownInterval = null

const roundDistance = computed(() => {
  if (!guessCoord.value) {
    return 0
  }

  return haversineDistance(guessCoord.value, realCoord.value)
})

const roundScore = computed(() => {
  if (!guessCoord.value) {
    return 0
  }

  if (roundDistance.value <= SCORE_THRESHOLD) {
    return MAX_SCORE
  }

  return Math.round(
    MAX_SCORE * Math.exp(-SCORE_DECAY * (roundDistance.value - SCORE_THRESHOLD)),
  )
})

const totalScore = computed(() => score.value + roundScore.value)
const accumulatedDistance = computed(() => meters.value + roundDistance.value)
const isInfiniteMode = computed(() => gamemode.value === 'Modo infinito')
const isCustomMode = computed(() => gamemode.value === CUSTOM_GAMEMODE_NAME)
const roundLimit = computed(() => (isCustomMode.value ? customSettings.value.rounds : MAX_ROUNDS))
const roundDuration = computed(() => (isCustomMode.value ? customSettings.value.timePerRound : DEFAULT_ROUND_DURATION))
const isMovementDisabled = computed(() => {
  if (isCustomMode.value) {
    return customSettings.value.disableMovement
  }

  return gamemode.value === 'Sin movimiento'
})
const isLastRound = computed(() => !isInfiniteMode.value && round.value >= roundLimit.value)

initializeGame()

watch(
  () => route.query.gamemode,
  (queryGamemode, previousGamemode) => {
    if (queryGamemode === previousGamemode) {
      return
    }

    const nextGamemode = resolveGamemode(queryGamemode)
    const nextCustomSettings = nextGamemode === CUSTOM_GAMEMODE_NAME
      ? loadStoredCustomSettings()
      : { ...DEFAULT_CUSTOM_GAME_SETTINGS }

    if (nextGamemode !== gamemode.value) {
      startNewGame(nextGamemode, nextCustomSettings)
    }
  },
)

watch(
  [gamemode, customSettings, round, usedNodeIds, initialCoord, realCoord, guessCoord, score, meters, showResults],
  persistSession,
  { deep: true },
)

watch([countdown, timeExpired, roundDeadline], persistSession, { deep: true })

function resolveGamemode(queryGamemode) {
  return typeof queryGamemode === 'string' && queryGamemode.trim()
    ? queryGamemode
    : DEFAULT_GAMEMODE
}

function initializeGame() {
  const hasExplicitGamemode = typeof route.query.gamemode === 'string' && route.query.gamemode.trim()
  const queryGamemode = resolveGamemode(route.query.gamemode)
  const restoredSession = restoreSession()

  if (restoredSession && (!hasExplicitGamemode || restoredSession.gamemode === queryGamemode)) {
    if (!showResults.value && !timeExpired.value) {
      resumeRoundTimer()
    }

    toast.add({
      severity: 'info',
      summary: 'Sesion restaurada',
      detail: 'Continuamos tu partida anterior.',
      life: 3000,
    })
    return
  }

  const nextCustomSettings = queryGamemode === CUSTOM_GAMEMODE_NAME
    ? loadStoredCustomSettings()
    : { ...DEFAULT_CUSTOM_GAME_SETTINGS }

  startNewGame(queryGamemode, nextCustomSettings)
}

function loadStoredCustomSettings() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CUSTOM_GAME_SETTINGS }
  }

  try {
    const rawSettings = window.sessionStorage.getItem(CUSTOM_GAME_SETTINGS_STORAGE_KEY)

    if (!rawSettings) {
      return { ...DEFAULT_CUSTOM_GAME_SETTINGS }
    }

    return normalizeCustomGameSettings(JSON.parse(rawSettings))
  } catch (error) {
    console.error('Failed to restore custom game settings', error)
    window.sessionStorage.removeItem(CUSTOM_GAME_SETTINGS_STORAGE_KEY)
    return { ...DEFAULT_CUSTOM_GAME_SETTINGS }
  }
}

function restoreSession() {
  if (typeof window === 'undefined') {
    return false
  }

  const savedSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (!savedSession) {
    return false
  }

  try {
    const parsedSession = JSON.parse(savedSession)

    const restoredSession = {
      gamemode: parsedSession.gamemode || DEFAULT_GAMEMODE,
      customSettings: normalizeCustomGameSettings(parsedSession.customSettings),
      round: parsedSession.round || 1,
      usedNodeIds: Array.isArray(parsedSession.usedNodeIds) ? parsedSession.usedNodeIds : [],
      initialCoord: parsedSession.initialCoord || null,
      realCoord: parsedSession.realCoord || { lat: 0, lng: 0 },
      guessCoord: parsedSession.guessCoord || null,
      score: parsedSession.score || 0,
      meters: parsedSession.meters || 0,
      showResults: Boolean(parsedSession.showResults),
      countdown: parsedSession.countdown || DEFAULT_ROUND_DURATION,
      timeExpired: Boolean(parsedSession.timeExpired),
      roundDeadline: parsedSession.roundDeadline || null,
    }

    gamemode.value = restoredSession.gamemode
    customSettings.value = restoredSession.customSettings
    round.value = restoredSession.round
    usedNodeIds.value = restoredSession.usedNodeIds
    initialCoord.value = restoredSession.initialCoord
    realCoord.value = restoredSession.realCoord
    guessCoord.value = restoredSession.guessCoord
    score.value = restoredSession.score
    meters.value = restoredSession.meters
    showResults.value = restoredSession.showResults
    countdown.value = restoredSession.countdown
    timeExpired.value = restoredSession.timeExpired
    roundDeadline.value = restoredSession.roundDeadline

    return restoredSession
  } catch (error) {
    console.error('Failed to restore game session', error)
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return false
  }
}

function persistSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      gamemode: gamemode.value,
      customSettings: customSettings.value,
      round: round.value,
      usedNodeIds: usedNodeIds.value,
      initialCoord: initialCoord.value,
      realCoord: realCoord.value,
      guessCoord: guessCoord.value,
      score: score.value,
      meters: meters.value,
      showResults: showResults.value,
      countdown: countdown.value,
      timeExpired: timeExpired.value,
      roundDeadline: roundDeadline.value,
    }),
  )
}

function clearSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function clearCountdownInterval() {
  clearInterval(countdownInterval)
  countdownInterval = null
}

function syncCountdown() {
  if (!roundDeadline.value) {
    return
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil((roundDeadline.value - Date.now()) / 1000),
  )

  countdown.value = remainingSeconds

  if (remainingSeconds > 0) {
    return
  }

  timeExpired.value = true
  roundDeadline.value = null
  clearCountdownInterval()
}

function startRoundTimer(durationSeconds = roundDuration.value) {
  clearCountdownInterval()
  timeExpired.value = false
  countdown.value = durationSeconds
  roundDeadline.value = Date.now() + durationSeconds * 1000
  syncCountdown()
  countdownInterval = setInterval(syncCountdown, 1000)
}

function resumeRoundTimer() {
  if (!roundDeadline.value) {
    return
  }

  clearCountdownInterval()
  syncCountdown()

  if (!timeExpired.value) {
    countdownInterval = setInterval(syncCountdown, 1000)
  }
}

function stopRoundTimer() {
  clearCountdownInterval()
  roundDeadline.value = null
}

async function loadRound() {
  try {
    const randomDifficulty = getRandomDifficulty()
    const coord = isCustomMode.value
      ? await getFilteredRandomNode(usedNodeIds.value, {
        municipalities: customSettings.value.municipalities,
        difficulty: customSettings.value.difficulty,
      })
      : await getRandomNode(usedNodeIds.value, randomDifficulty)

    realCoord.value = { lat: coord.lat, lng: coord.lng }
    initialCoord.value = { lat: coord.lat, lng: coord.lng }
    usedNodeIds.value = [...usedNodeIds.value, coord.id]
    startRoundTimer(roundDuration.value)
  } catch (error) {
    console.error('Fetch coordinates from local SQLite failed', error)
  }
}

async function startNewGame(nextGamemode = gamemode.value, nextCustomSettings = customSettings.value) {
  gamemode.value = nextGamemode
  customSettings.value = nextGamemode === CUSTOM_GAMEMODE_NAME
    ? normalizeCustomGameSettings(nextCustomSettings)
    : { ...DEFAULT_CUSTOM_GAME_SETTINGS }
  round.value = 1
  usedNodeIds.value = []
  initialCoord.value = null
  realCoord.value = { lat: 0, lng: 0 }
  guessCoord.value = null
  score.value = 0
  meters.value = 0
  showResults.value = false
  countdown.value = roundDuration.value
  timeExpired.value = false
  roundDeadline.value = null
  await loadRound()
}

function handleGuess(position) {
  stopRoundTimer()
  guessCoord.value = position
  showResults.value = true
}

function handleReturnToStart() {
  if (!initialCoord.value) {
    console.warn('Coordenada inicial no está definida')
    return
  }

  realCoord.value = { ...initialCoord.value }
}

async function handleNextRound() {
  score.value = totalScore.value
  meters.value = accumulatedDistance.value
  round.value += 1
  guessCoord.value = null
  showResults.value = false
  await loadRound()
}

async function handlePlayAgain() {
  await startNewGame(gamemode.value)
}

function handleBackToMenu() {
  stopRoundTimer()
  clearSession()
  router.push({ path: '/' })
}

onBeforeUnmount(() => {
  clearCountdownInterval()
})
</script>

<template>
  <PlayGame
    v-if="!showResults"
    :gamemode="gamemode"
    :round="round"
    :score="score"
    :disable-movement="isMovementDisabled"
    :countdown="countdown"
    :time-expired="timeExpired"
    :real-coord="realCoord"
    @guess="handleGuess"
    @back-to-menu="handleBackToMenu"
    @return-to-start="handleReturnToStart"
    @play-again="handlePlayAgain"
  />

  <ResultsScreen
    v-else
    :guess-coord="guessCoord"
    :real-coord="realCoord"
    :round="round"
    :round-distance="roundDistance"
    :round-score="roundScore"
    :total-score="totalScore"
    :accumulated-distance="accumulatedDistance"
    :is-last-round="isLastRound"
    @next-round="handleNextRound"
    @play-again="handlePlayAgain"
    @back-to-menu="handleBackToMenu"
  />
</template>
