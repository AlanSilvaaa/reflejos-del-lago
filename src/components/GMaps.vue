<script setup>
import { computed } from 'vue'
import { GoogleMap, AdvancedMarker, Polyline, Polygon } from 'vue3-google-map'
import ProvinciaDeLlanquihue from '@/data/boundaries/ProvinciaDeLlanquihue.json'

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

const ProvinciaDeLlanquihueOutline = ProvinciaDeLlanquihue.map((ring) => ({
  paths: ring,
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
  fillOpacity: 0,
  clickable: false
}))

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const mapId = import.meta.env.VITE_GOOGLE_MAP_ID

const lineProperties = computed(() => ({
  path: [props.guessCoord, props.realCoord],
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2,
}))
</script>

<template>
  <div class="relative z-0">
    <GoogleMap :api-key="apiKey" :map-id="mapId" style="width: 100%; height: 100vh" :libraries="['places', 'marker']"
      :center="realCoord" :zoom="12" :disable-default-ui="true">
      <AdvancedMarker :options="{ position: guessCoord }"
        :pin-options="{ background: '#2b4cf0', borderColor: '#000000', glyphText: '📍' }" />
      <AdvancedMarker :options="{ position: realCoord }"
        :pin-options="{ background: '#2bf060', borderColor: '#000000', glyphText: '✅' }" />
      <Polyline :options="lineProperties" />
      <Polygon v-for="(opts, idx) in ProvinciaDeLlanquihueOutline" :key="idx" :options="opts" />
    </GoogleMap>
  </div>
</template>
