<script setup>
import confetti from 'canvas-confetti'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import GMaps from '@/components/GMaps.vue'

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

const displayRoundScore = computed(() => Math.round(props.roundScore))
const displayTotalScore = computed(() => Math.round(props.totalScore))

const displayRoundDistance = computed(() => {
  if (props.roundDistance >= 1000) {
    return `${(props.roundDistance / 1000).toFixed(2)} kilómetros`
  }

  return `${props.roundDistance.toFixed(2)} metros`
})

const formattedTotalDistance = computed(() => {
  if (props.accumulatedDistance >= 1000) {
    return `${(props.accumulatedDistance / 1000).toFixed(2)} kilómetros`
  }

  return `${props.accumulatedDistance.toFixed(2)} metros`
})

const roundStatus = computed(() => {
  if (props.roundScore >= 4500) {
    return {
      label: 'Precision alta',
      icon: 'pi pi-star-fill',
      tone: 'text-emerald-300',
      chip: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
    }
  }

  if (props.roundScore >= 2500) {
    return {
      label: 'Buen intento',
      icon: 'pi pi-compass',
      tone: 'text-sky-300',
      chip: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
    }
  }

  return {
    label: '',
    icon: 'pi pi-map-marker',
    tone: 'text-amber-300',
    chip: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
  }
})

const primaryActionLabel = computed(() => (props.isLastRound ? 'Ver resultados finales' : 'Siguiente ronda'))

function handlePrimaryAction() {
  if (props.isLastRound) {
    showFinalResults.value = true
    return
  }

  emit('nextRound')
}

function handleKeydown(event) {
  const target = event.target
  const isEditableTarget =
    target instanceof HTMLElement
    && (target.isContentEditable
      || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))

  if (event.code !== 'Space' || isEditableTarget || showFinalResults.value) {
    return
  }

  event.preventDefault()
  handlePrimaryAction()
}

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
  window.addEventListener('keydown', handleKeydown)

  if (props.roundScore < CONFETTI_SCORE_THRESHOLD) {
    return
  }

  launchSideConfetti()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  confettiTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
})
</script>

<template>
  <div class="relative h-screen w-full overflow-hidden text-white">
    <GMaps :guess-coord="guessCoord" :real-coord="realCoord" />

    <div class="absolute left-4 top-4 z-20">
      <Button
        icon="pi pi-home"
        rounded
        text
        severity="contrast"
        aria-label="Ir al inicio"
        :style="{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.35)' }"
        @click="emit('backToMenu')"
      />
    </div>

    <div class="absolute inset-y-0 right-0 z-20 flex items-center px-4 py-6">
      <section
        class="w-[min(24rem,calc(100vw-2rem))] rounded-[2rem] border border-white/10 p-5 shadow-2xl"
        :style="{ backgroundColor: 'rgba(15, 23, 42, 0.92)' }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="mb-3 flex items-center gap-2">
              <Tag
                rounded
                severity="secondary"
                :pt="{
                  root: { class: 'border border-white/10 bg-slate-950/80 text-white' },
                  label: { class: 'text-xs font-semibold' },
                }"
                :value="`Ronda ${round}`"
              />
            </div>
            <p class="m-0 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-slate-400">Resultado de la ronda</p>
            <div class="mt-2 flex items-end gap-2">
              <span class="text-4xl font-bold leading-none text-white tabular-nums">{{ displayRoundScore }}</span>
              <span class="pb-1 text-sm font-medium text-slate-400">puntos</span>
            </div>
          </div>
          <Tag
            v-if="roundStatus.label"
            rounded
            :icon="roundStatus.icon"
            :value="roundStatus.label"
            :pt="{
              root: { class: `border ${roundStatus.chip}` },
              icon: { class: 'text-[0.75rem]' },
              label: { class: 'text-[0.72rem] font-semibold' },
            }"
          />
          <div
            v-else
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400/25 bg-amber-500/10 text-amber-200"
          >
            <i :class="[roundStatus.icon, 'text-[0.75rem]']" />
          </div>
        </div>

        <div class="pt-4">
          <div class="mb-2 flex items-center gap-2 text-slate-400">
            <i class="pi pi-send text-xs" />
            <span class="text-[0.68rem] font-medium uppercase tracking-[0.18em]">Tu error</span>
          </div>
          <p class="m-0 text-lg font-semibold text-white">{{ displayRoundDistance }}</p>
        </div>

        <div class="pt-4">
          <div class="mb-3 flex items-center gap-2 text-slate-400">
            <i class="pi pi-map text-xs" />
            <span class="text-[0.68rem] font-medium uppercase tracking-[0.18em]">Lectura del mapa</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <Tag
              rounded
              severity="secondary"
              :pt="{
                root: { class: 'border border-white/10 bg-slate-900/90 text-slate-200' },
                label: { class: 'text-[0.72rem] font-medium' },
              }"
              value="📍 Tu marca"
            />
            <Tag
              rounded
              severity="secondary"
              :pt="{
                root: { class: 'border border-white/10 bg-slate-900/90 text-slate-200' },
                label: { class: 'text-[0.72rem] font-medium' },
              }"
              value="✅ Punto real"
            />
            <Tag
              rounded
              severity="secondary"
              :pt="{
                root: { class: 'border border-white/10 bg-slate-900/90 text-slate-200' },
                label: { class: 'text-[0.72rem] font-medium' },
              }"
              value="⋯ Trayectoria"
            />
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <Button
            :label="primaryActionLabel"
            rounded
            class="w-full"
            :pt="{
              root: { class: 'border-0 bg-emerald-400 text-slate-950 shadow-none hover:bg-emerald-300' },
              label: { class: 'font-semibold' },
            }"
            @click="handlePrimaryAction"
          />
        </div>
      </section>
    </div>

    <Dialog
      v-model:visible="showFinalResults"
      modal
      :draggable="false"
      :closable="false"
      :style="{ width: 'min(30rem, 92vw)' }"
      :pt="{
        root: { class: 'overflow-hidden border border-white/10 bg-slate-950 text-white shadow-2xl' },
        header: { class: 'bg-slate-950 text-white border-b border-white/8' },
        content: { class: 'bg-slate-950 text-white' },
      }"
    >
      <template #header>
        <div>
          <p class="m-0 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-slate-400">Sesion completada</p>
          <h2 class="m-0 mt-1 text-xl font-semibold text-white">Resultados finales</h2>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-white/8 bg-slate-900/80 p-4">
            <p class="m-0 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-400">Puntaje final</p>
            <p class="m-0 mt-2 text-3xl font-bold tabular-nums text-white">{{ displayTotalScore }}</p>
          </div>
          <div class="rounded-2xl border border-white/8 bg-slate-900/80 p-4">
            <p class="m-0 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-400">Distancia total</p>
            <p class="m-0 mt-2 text-lg font-semibold text-white">{{ formattedTotalDistance }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-white/8 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300">
          Resultados calculados localmente en esta sesion para mantener la partida ligera y directa.
        </div>

        <div class="flex gap-3">
          <Button
            label="Volver a jugar"
            rounded
            class="flex-1"
            :pt="{
              root: { class: 'border-0 bg-emerald-400 text-slate-950 shadow-none hover:bg-emerald-300' },
              label: { class: 'font-semibold' },
            }"
            @click="emit('playAgain')"
          />
          <Button
            label="Volver al menu"
            rounded
            severity="secondary"
            class="flex-1"
            :pt="{
              root: { class: 'border border-white/10 bg-slate-900 text-white shadow-none hover:bg-slate-800' },
              label: { class: 'font-semibold' },
            }"
            @click="emit('backToMenu')"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
