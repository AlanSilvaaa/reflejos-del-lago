<script setup>
/* global google */
import { onMounted, ref, watch } from 'vue'
import StreetViewMiniMap from '@/components/StreetViewMiniMap.vue'
import ProvinciaDeLlanquihue from '@/data/boundaries/ProvinciaDeLlanquihue.json'

const props = defineProps({
  gamemode: {
    type: String,
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

const emits = defineEmits(['guessClick'])
const clickedPosition = ref(null)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const centerMinimap = { lat: -41.333333333333, lng: -72.833333333333 }
const mapInstance = ref(null)
const marker = ref(null)
const googleMapComponent = ref(null)
const panoramaInstance = ref(null)
const streetViewElement = ref(null)

watch(
  [() => props.realCoord, streetViewElement],
  ([coord, element]) => {
    if (coord.lat === 0 || coord.lng === 0 || !window.google || !element) {
      return
    }

    const panoramaOptions = {
      position: coord,
      pov: { heading: 165, pitch: 0 },
      zoom: 1,
      addressControl: false,
      disableDefaultUI: true,
      showRoadLabels: false,
    }

    if (props.gamemode === 'Sin movimiento') {
      panoramaOptions.clickToGo = false
      panoramaOptions.linksControl = false
      panoramaOptions.panControl = false
    }

    panoramaInstance.value = new google.maps.StreetViewPanorama(
      element,
      panoramaOptions,
    )
  },
  { immediate: true },
)

function submitGuess() {
  if (!clickedPosition.value) {
    alert('Debes hacer clic en el mapa.')
    return
  }

  emits('guessClick', clickedPosition.value)
}


onMounted(() => {
  const checkMap = setInterval(() => {
    const map = googleMapComponent.value?.map
    if (map) {
      clearInterval(checkMap)
      mapInstance.value = map

      map.addListener('click', (event) => {
        clickedPosition.value = event.latLng.toJSON()

        if (marker.value) {
          marker.value.setMap(null)
        }

        marker.value = new google.maps.Marker({
          position: event.latLng,
          map: map,
        })
      })
    }
  }, 200)
})

</script>

<template>
  <div class="relative z-0" style="width: 100%; height: 100vh">
    <div ref="streetViewElement" style="width: 100%; height: 100vh"></div>
    <StreetViewMiniMap
      v-model:google-map-component="googleMapComponent"
      :api-key="apiKey"
      :center="centerMinimap"
      :outline="ProvinciaDeLlanquihueOutline"
      @submit-guess="submitGuess"
    />
  </div>

</template>
