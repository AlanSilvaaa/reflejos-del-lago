<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRoute, useRouter } from 'vue-router'
import PlayGame from '@/screens/PlayGame.vue'
import ResultsScreen from '@/screens/ResultsScreen.vue'
import haversineDistance from '@/helpers/haversineDistance.ts'
import { getRandomNode } from '@/services/reflejosDb'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const DEFAULT_GAMEMODE = 'Modo normal'
const MAX_ROUNDS = 3
const MAX_SCORE = 5000
const SCORE_THRESHOLD = 50
const SCORE_DECAY = 0.0005
const SESSION_STORAGE_KEY = 'game-session'

const gamemode = ref(DEFAULT_GAMEMODE)
const round = ref(1)
const usedNodeIds = ref([])
const initialCoord = ref(null)
const realCoord = ref({ lat: 0, lng: 0 })
const guessCoord = ref(null)
const score = ref(0)
const meters = ref(0)
const showResults = ref(false)
const countdown = ref(180)
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
const isLastRound = computed(() => !isInfiniteMode.value && round.value >= MAX_ROUNDS)

initializeGame()

watch(
  () => route.query.gamemode,
  (queryGamemode, previousGamemode) => {
    if (queryGamemode === previousGamemode) {
      return
    }

    const nextGamemode = resolveGamemode(queryGamemode)

    if (nextGamemode !== gamemode.value) {
      startNewGame(nextGamemode)
    }
  },
)

watch(
  [gamemode, round, usedNodeIds, initialCoord, realCoord, guessCoord, score, meters, showResults],
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

  startNewGame(queryGamemode)
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
      round: parsedSession.round || 1,
      usedNodeIds: Array.isArray(parsedSession.usedNodeIds) ? parsedSession.usedNodeIds : [],
      initialCoord: parsedSession.initialCoord || null,
      realCoord: parsedSession.realCoord || { lat: 0, lng: 0 },
      guessCoord: parsedSession.guessCoord || null,
      score: parsedSession.score || 0,
      meters: parsedSession.meters || 0,
      showResults: Boolean(parsedSession.showResults),
      countdown: parsedSession.countdown || 180,
      timeExpired: Boolean(parsedSession.timeExpired),
      roundDeadline: parsedSession.roundDeadline || null,
    }

    gamemode.value = restoredSession.gamemode
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

function startRoundTimer(durationSeconds = 180) {
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
    const coord = await getRandomNode(usedNodeIds.value)

    realCoord.value = { lat: coord.lat, lng: coord.lng }
    initialCoord.value = { lat: coord.lat, lng: coord.lng }
    usedNodeIds.value = [...usedNodeIds.value, coord.id]
    startRoundTimer()
  } catch (error) {
    console.error('Fetch coordinates from local SQLite failed', error)
  }
}

async function startNewGame(nextGamemode = gamemode.value) {
  gamemode.value = nextGamemode
  round.value = 1
  usedNodeIds.value = []
  initialCoord.value = null
  realCoord.value = { lat: 0, lng: 0 }
  guessCoord.value = null
  score.value = 0
  meters.value = 0
  showResults.value = false
  countdown.value = 180
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
