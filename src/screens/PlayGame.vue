<script setup>
import StreetView from '@/components/StreetView.vue'
import GameStatusBar from '@/components/GameStatusBar.vue'
import GameControls from '@/components/GameControls.vue'
import TimeExpiredOverlay from '@/components/TimeExpiredOverlay.vue'

defineProps({
  gamemode: {
    type: String,
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  countdown: {
    type: Number,
    required: true,
  },
  timeExpired: {
    type: Boolean,
    default: false,
  },
  realCoord: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['guess', 'backToMenu', 'returnToStart', 'playAgain'])

function handleGuessClick(position) {
  emit('guess', position)
}

function playAgain() {
  emit('playAgain')
}

function backToMenu() {
  emit('backToMenu')
}

function returnToStart() {
  emit('returnToStart')
}
</script>

<template>
  <div class="relative h-screen w-full">
    <StreetView :gamemode="gamemode" :real-coord="realCoord" @guess-click="handleGuessClick" />

    <GameControls
      :can-return-to-start="gamemode !== 'Sin movimiento'"
      @back-to-menu="backToMenu"
      @return-to-start="returnToStart"
    />

    <GameStatusBar :round="round" :score="score" :countdown="countdown" />

    <TimeExpiredOverlay
      :visible="timeExpired"
      @play-again="playAgain"
      @back-to-menu="backToMenu"
    />
  </div>
</template>
