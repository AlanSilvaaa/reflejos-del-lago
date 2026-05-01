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
    <StreetView
      :gamemode="gamemode"
      :round="round"
      :score="score"
      :real-coord="realCoord"
      @guess-click="handleGuessClick"
      @return-to-start="returnToStart"
    />

    <GameControls @back-to-menu="backToMenu" />

    <GameStatusBar :countdown="countdown" :total-seconds="180" />

    <TimeExpiredOverlay
      :visible="timeExpired"
      @play-again="playAgain"
      @back-to-menu="backToMenu"
    />
  </div>
</template>
