<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { GoogleMap, AdvancedMarker, Polyline, Polygon } from 'vue3-google-map'
import {
  applyProvinceMapRestriction,
  drawProvinceBoundaryMask,
  provinceOutline,
} from '@/helpers/provinceMap'

const props = defineProps({
  guessCoord: {
    type: Object,
    required: true,
  },
  realCoord: {
    type: Object,
    required: true,
  },
})

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const mapId = import.meta.env.VITE_GOOGLE_MAP_ID
const googleMapComponent = ref(null)
const boundaryMask = ref(null)
let mapReadyInterval = null

const mapCenter = computed(() => ({
  lat: (props.guessCoord.lat + props.realCoord.lat) / 2,
  lng: (props.guessCoord.lng + props.realCoord.lng) / 2,
}))

const lineProperties = computed(() => ({
  path: [props.guessCoord, props.realCoord],
  geodesic: true,
  strokeOpacity: 0,
  icons: [
    {
      icon: {
        path: 'M 0,-1 0,1',
        strokeColor: '#000000',
        strokeOpacity: 1,
        scale: 3,
      },
      offset: '0',
      repeat: '12px',
    },
  ],
}))

watch([() => props.guessCoord, () => props.realCoord], fitMapToMarkers, { deep: true })

// Fit the result map to both markers so the guess and the correct answer are visible together.
function fitMapToMarkers() {
  const map = googleMapComponent.value?.map
  const LatLngBounds = window.google?.maps?.LatLngBounds

  if (!map || typeof LatLngBounds !== 'function') {
    return
  }

  const bounds = new LatLngBounds()
  bounds.extend(props.guessCoord)
  bounds.extend(props.realCoord)
  map.fitBounds(bounds, 80)
  applyProvinceMapRestriction(map)
}

onMounted(() => {
  mapReadyInterval = window.setInterval(() => {
    if (!googleMapComponent.value?.map) {
      return
    }

    window.clearInterval(mapReadyInterval)
    mapReadyInterval = null
    boundaryMask.value = drawProvinceBoundaryMask(googleMapComponent.value.map, boundaryMask.value)
    fitMapToMarkers()
  }, 200)
})

onBeforeUnmount(() => {
  if (mapReadyInterval) {
    window.clearInterval(mapReadyInterval)
  }

  boundaryMask.value?.setMap(null)
})
</script>

<template>
  <div class="relative z-0">
    <GoogleMap ref="googleMapComponent" :api-key="apiKey" :map-id="mapId" style="width: 100%; height: 100vh" :libraries="['places', 'marker']"
      :center="mapCenter" :zoom="8" :disable-default-ui="true">
      <AdvancedMarker :options="{ position: guessCoord }"
        :pin-options="{ background: '#2b4cf0', borderColor: '#000000', glyphText: '📍' }" />
      <AdvancedMarker :options="{ position: realCoord }"
        :pin-options="{ background: '#2bf060', borderColor: '#000000', glyphText: '✅' }" />
      <Polyline :options="lineProperties" />
      <Polygon v-for="(opts, idx) in provinceOutline" :key="idx" :options="opts" />
    </GoogleMap>
  </div>
</template>
