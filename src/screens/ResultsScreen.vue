<script setup>
import confetti from 'canvas-confetti'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GMaps from '@/components/GMaps.vue'
import ResultsSummaryPanel from '@/components/ResultsSummaryPanel.vue'

const CONFETTI_SCORE_THRESHOLD = 4500

const props = defineProps({
  guessCoord: {
    type: Object,
    required: true,
  },
  realCoord: {
    type: Object,
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  roundDistance: {
    type: Number,
    required: true,
  },
  roundScore: {
    type: Number,
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  accumulatedDistance: {
    type: Number,
    required: true,
  },
  isLastRound: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['nextRound', 'playAgain', 'backToMenu'])

const showFinalResults = ref(false)
const confettiTimeoutIds = []

const displayRoundDistance = computed(() => {
  return `${props.roundDistance.toFixed(2)} metros`
})

const formattedTotalDistance = computed(() => {
  if (props.accumulatedDistance >= 1000) {
    return `${(props.accumulatedDistance / 1000).toFixed(2)} kilómetros`
  }

  return `${props.accumulatedDistance.toFixed(2)} metros`
})

/**
 * Launch confetti from both sides of the screen with a delay between bursts when the player achieves a score above the CONFETTI_SCORE_THRESHOLD.
 */
function launchSideConfetti() {
  const bursts = [0, 180, 360]

  bursts.forEach((delay) => {
    const timeoutId = window.setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 55,
        startVelocity: 45,
        origin: { x: 0, y: 0.7 },
      })

      confetti({
        particleCount: 70,
        angle: 120,
        spread: 55,
        startVelocity: 45,
        origin: { x: 1, y: 0.7 },
      })
    }, delay)

    confettiTimeoutIds.push(timeoutId)
  })
}

onMounted(() => {
  if (props.roundScore < CONFETTI_SCORE_THRESHOLD) {
    return
  }

  launchSideConfetti()
})

onBeforeUnmount(() => {
  confettiTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
})
</script>

<template>
  <div class="relative">
    <GMaps :guess-coord="guessCoord" :real-coord="realCoord" />
    <ResultsSummaryPanel
      :distance="displayRoundDistance"
      :round-score="roundScore"
      :total-score="totalScore"
      :round="round"
      :is-last-round="isLastRound"
      :show-final-results="showFinalResults"
      :formatted-total-distance="formattedTotalDistance"
      @next-round="emit('nextRound')"
      @show-final-results="showFinalResults = true"
      @play-again="emit('playAgain')"
      @back-to-menu="emit('backToMenu')"
    />
  </div>
</template>
