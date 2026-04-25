<script setup>
import { computed, ref } from 'vue'
import GMaps from '@/components/GMaps.vue'
import ResultsSummaryPanel from '@/components/ResultsSummaryPanel.vue'

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

const displayRoundDistance = computed(() => {
  return `${props.roundDistance.toFixed(2)} metros`
})

const formattedTotalDistance = computed(() => {
  if (props.accumulatedDistance >= 1000) {
    return `${(props.accumulatedDistance / 1000).toFixed(2)} kilómetros`
  }

  return `${props.accumulatedDistance.toFixed(2)} metros`
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
