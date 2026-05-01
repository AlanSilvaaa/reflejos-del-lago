<script setup>
import { computed } from 'vue'

const props = defineProps({
  countdown: {
    type: Number,
    required: true,
  },
  totalSeconds: {
    type: Number,
    default: 180,
  },
})

const countdownProgress = computed(() => {
  if (props.totalSeconds <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, (props.countdown / props.totalSeconds) * 100))
})

const isUrgent = computed(() => props.countdown <= 30)

function formatCountdown(seconds) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="absolute top-4 left-1/2 z-50 -translate-x-1/2">
    <div
      class="h-10 min-w-[220px] rounded-full border px-3 transition-colors duration-300"
      :class="isUrgent
        ? 'border-amber-400/35 bg-black/35 text-white'
        : 'border-white/10 bg-black/35 text-white'"
    >
      <div class="flex h-full items-center gap-3">
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        >
          <i class="pi pi-clock text-xs" :class="isUrgent ? 'text-amber-300' : 'text-slate-100'" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="relative h-7 overflow-hidden rounded-full bg-slate-950/80">
            <div
              class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
              :class="isUrgent ? 'bg-red-500/90' : 'bg-emerald-400/85'"
              :style="{ width: `${countdownProgress}%` }"
            />
            <div class="relative z-10 flex h-full items-center justify-center px-3 text-sm font-semibold tabular-nums text-white">
              {{ formatCountdown(countdown) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
