<script setup>
defineProps({
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
})

function formatCountdown(seconds) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 gap-3">
    <div class="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow">
      Ronda: {{ round }}
    </div>
    <div class="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow">
      Puntaje: {{ score.toFixed(0) }}
    </div>
    <div class="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow">
      Tiempo restante: {{ formatCountdown(countdown) }}
    </div>
  </div>
</template>
