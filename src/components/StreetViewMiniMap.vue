<script setup>
import { ref } from 'vue'
import { GoogleMap, Polygon } from 'vue3-google-map'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

defineProps({
  apiKey: {
    type: String,
    required: true,
  },
  center: {
    type: Object,
    required: true,
  },
  outline: {
    type: Array,
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
  canReturnToStart: {
    type: Boolean,
    default: false,
  },
})

const googleMapComponent = defineModel('googleMapComponent')
const isExpanded = ref(false)

defineEmits(['submitGuess', 'returnToStart'])
</script>

<template>
  <div
    class="absolute bottom-4 right-4 z-10 flex flex-col gap-3 transition-all duration-300"
    :class="isExpanded ? 'w-[320px] opacity-100' : 'w-[250px] opacity-50'"
    @mouseleave="isExpanded = false"
  >
    <div class="flex justify-end gap-2">
      <Button
        v-if="canReturnToStart"
        icon="pi pi-map-marker"
        rounded
        severity="secondary"
        aria-label="Volver a la posicion inicial"
        class="h-8 w-8 border border-surface-700/70 bg-surface-900/88 text-surface-0 shadow-lg backdrop-blur-md"
        @click="$emit('returnToStart')"
      />
      <Tag
        severity="secondary"
        rounded
        :pt="{
          root: { class: 'border border-surface-700/70 bg-surface-900/88 px-2.5 py-1.5 text-surface-0 shadow-lg backdrop-blur-md' },
          icon: { class: 'text-[0.75rem] text-surface-300' },
          label: { class: 'text-[0.8rem] font-semibold leading-none text-surface-0' },
        }"
        icon="pi pi-map"
        :value="String(round)"
        aria-label="Ronda actual"
      />
      <Tag
        severity="secondary"
        rounded
        :pt="{
          root: { class: 'border border-surface-700/70 bg-surface-900/88 px-2.5 py-1.5 text-surface-0 shadow-lg backdrop-blur-md' },
          icon: { class: 'text-[0.75rem] text-surface-300' },
          label: { class: 'text-[0.8rem] font-semibold leading-none text-surface-0' },
        }"
        icon="pi pi-star-fill"
        :value="score.toFixed(0)"
        aria-label="Puntaje acumulado"
      />
    </div>

    <div class="aspect-square overflow-hidden rounded-md" @mouseenter="isExpanded = true">
      <GoogleMap
        ref="googleMapComponent"
        :api-key="apiKey"
        :libraries="['places', 'marker']"
        style="width: 100%; height: 100%"
        :center="center"
        :zoom="7"
        :disable-default-ui="true"
      >
        <Polygon v-for="(opts, idx) in outline" :key="idx" :options="opts" />
      </GoogleMap>
    </div>

    <div class="w-full">
      <Button severity="success" raised class="w-full text-sm px-4 py-2" @click="$emit('submitGuess')">
        Adivinar
      </Button>
    </div>
  </div>
</template>
