<script setup>
import { computed, ref } from 'vue'
import { GoogleMap, Polygon } from 'vue3-google-map'
import Tag from 'primevue/tag'
import { LLANQUIHUE_CENTER, LLANQUIHUE_MUNICIPALITIES } from '@/data/municipalities'

const props = defineProps({
  selectedMunicipalities: {
    type: Array,
    default: () => [],
  },
  initialZoom: {
    type: Number,
    default: 8,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleMunicipality'])

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const hoveredMunicipality = ref('')

const selectedSet = computed(() => new Set(props.selectedMunicipalities))

function blendHexColor(hex, targetHex, amount) {
  const normalizedHex = hex.replace('#', '')
  const normalizedTarget = targetHex.replace('#', '')
  const source = Number.parseInt(normalizedHex, 16)
  const target = Number.parseInt(normalizedTarget, 16)

  const r = Math.round(((source >> 16) & 255) * (1 - amount) + ((target >> 16) & 255) * amount)
  const g = Math.round(((source >> 8) & 255) * (1 - amount) + ((target >> 8) & 255) * amount)
  const b = Math.round((source & 255) * (1 - amount) + (target & 255) * amount)

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const polygonGroups = computed(() => {
  return LLANQUIHUE_MUNICIPALITIES.map((municipality) => {
    const isSelected = selectedSet.value.has(municipality.name)
    const isHovered = hoveredMunicipality.value === municipality.name
    const fillOpacity = isSelected ? 0.58 : isHovered ? 0.42 : 0.3
    const strokeOpacity = isSelected ? 1 : 0.8
    const strokeWeight = isSelected ? 3 : isHovered ? 2.5 : 2
    const fillColor = isSelected
      ? municipality.color
      : blendHexColor(blendHexColor(municipality.color, '#94a3b8', 0.4), '#ffffff', 0.08)
    const strokeColor = isSelected
      ? municipality.color
      : blendHexColor(municipality.color, '#cbd5e1', 0.3)

    return {
      name: municipality.name,
      polygons: municipality.rings.map((ring) => ({
        paths: ring,
        strokeColor,
        strokeOpacity,
        strokeWeight,
        fillColor,
        fillOpacity,
        clickable: true,
      })),
    }
  })
})

function handleToggleMunicipality(name) {
  if (!props.selectable) {
    return
  }

  emit('toggleMunicipality', name)
}
</script>

<template>
  <div class="relative h-full w-full">
    <div class="pointer-events-none absolute left-4 top-4 z-10">
      <Tag
        rounded
        severity="secondary"
        icon="pi pi-building"
        :pt="{
          root: { class: 'border border-white/10 bg-slate-950/90 text-white' },
          icon: { class: 'text-[0.72rem]' },
          label: { class: 'text-[0.72rem] font-medium' },
        }"
        :value="hoveredMunicipality || 'Explora el mapa'"
      />
    </div>

    <GoogleMap
      :api-key="apiKey"
      :libraries="['places', 'marker']"
      :disable-default-ui="true"
      :center="LLANQUIHUE_CENTER"
      :zoom="initialZoom"
      :options="{
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        clickableIcons: false,
        gestureHandling: 'none',
      }"
      style="width: 100%; height: 100%"
    >
      <template v-for="group in polygonGroups" :key="group.name">
        <Polygon
          v-for="(opts, idx) in group.polygons"
          :key="`${group.name}-${idx}`"
          :options="opts"
          @click="handleToggleMunicipality(group.name)"
          @mouseover="hoveredMunicipality = group.name"
          @mouseout="hoveredMunicipality = ''"
        />
      </template>
    </GoogleMap>
  </div>
</template>
