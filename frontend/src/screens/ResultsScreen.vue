<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GMaps from '@/components/GMaps.vue'
import ResultsSummaryPanel from '@/components/ResultsSummaryPanel.vue'

const route = useRoute()
const router = useRouter()
const showFinalResults = ref(false)

const guessCoord = computed(() => ({
  lat: parseFloat(route.query.miniLat),
  lng: parseFloat(route.query.miniLng),
}))

const realCoord = computed(() => ({
  lat: parseFloat(route.query.realLat),
  lng: parseFloat(route.query.realLng),
}))

const round = computed(() => parseInt(route.query.round, 10) || 1)
const totalDistance = computed(() => parseFloat(route.query.meters) || 0)
const previousScore = computed(() => parseFloat(route.query.score) || 0)

function haversineDistance(from, to) {
  const earthRadius = 6371000 // Meters
  const toRadians = (degrees) => degrees * (Math.PI / 180)
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const roundDistance = computed(() => haversineDistance(guessCoord.value, realCoord.value))

const roundScore = computed(() => {
  const maxScore = 5000
  const threshold = 50
  const decay = 0.0005

  if (roundDistance.value <= threshold) {
    return maxScore
  }

  return Math.round(maxScore * Math.exp(-decay * (roundDistance.value - threshold)))
})

const totalScore = computed(() => previousScore.value + roundScore.value)
const accumulatedDistance = computed(() => totalDistance.value + roundDistance.value)
const isLastRound = computed(() => round.value >= 3)

const formattedRoundDistance = computed(() => `${roundDistance.value.toFixed(2)} metros`)

const formattedTotalDistance = computed(() => {
  if (accumulatedDistance.value >= 1000) {
    return `${(accumulatedDistance.value / 1000).toFixed(2)} kilómetros`
  }

  return `${accumulatedDistance.value.toFixed(2)} metros`
})

function nextRound() {
  router.push({
    path: '/PlayGame',
    query: {
      round: round.value + 1,
      gamemode: route.query.gamemode,
      used: route.query.used,
      meters: accumulatedDistance.value.toFixed(2),
      score: totalScore.value.toFixed(0),
    },
  })
}

function playAgain() {
  router.push({
    path: '/PlayGame',
    query: {
      gamemode: route.query.gamemode,
    },
  })
}

function backToMenu() {
  router.push({ path: '/' })
}
</script>

<template>
  <div class="relative">
    <GMaps :guess-coord="guessCoord" :real-coord="realCoord" />
    <ResultsSummaryPanel
      :distance="formattedRoundDistance"
      :round-score="roundScore"
      :total-score="totalScore"
      :round="round"
      :is-last-round="isLastRound"
      :show-final-results="showFinalResults"
      :formatted-total-distance="formattedTotalDistance"
      @next-round="nextRound"
      @show-final-results="showFinalResults = true"
      @play-again="playAgain"
      @back-to-menu="backToMenu"
    />
  </div>
</template>
