<script setup>
/* global google */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import StreetViewMiniMap from '@/components/StreetViewMiniMap.vue'
import {
  PROVINCE_MINIMAP_CENTER,
  PROVINCE_MIN_ZOOM,
  applyProvinceMapRestriction,
  drawProvinceBoundaryMask,
  isWithinProvinceBoundary,
  provinceOutline,
} from '@/helpers/provinceMap.ts'

const props = defineProps({
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
  realCoord: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['guessClick', 'returnToStart'])
const clickedPosition = ref(null)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const centerMinimap = PROVINCE_MINIMAP_CENTER
const MINIMAP_ZOOM = PROVINCE_MIN_ZOOM
const mapInstance = ref(null)
const marker = ref(null)
const boundaryMask = ref(null)
const googleMapComponent = ref(null)
const panoramaInstance = ref(null)
const streetViewElement = ref(null)
let panoramaRetryInterval = null

watch(
  [() => props.realCoord, streetViewElement],
  ([coord, element]) => {
    if (coord.lat === 0 || coord.lng === 0 || !element) {
      return
    }

    initializePanorama(coord, element)
  },
  { immediate: true },
)

function buildPanoramaOptions(coord) {
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

  return panoramaOptions
}

function applyMinimapRestriction(map) {
  applyProvinceMapRestriction(map, MINIMAP_ZOOM)
}

function drawBoundaryMask(map) {
  boundaryMask.value = drawProvinceBoundaryMask(map, boundaryMask.value)
}

function initializePanorama(coord, element) {
  const StreetViewPanorama = window.google?.maps?.StreetViewPanorama

  if (typeof StreetViewPanorama !== 'function') {
    clearInterval(panoramaRetryInterval)
    panoramaRetryInterval = setInterval(() => {
      const RetryStreetViewPanorama = window.google?.maps?.StreetViewPanorama

      if (typeof RetryStreetViewPanorama !== 'function') {
        return
      }

      clearInterval(panoramaRetryInterval)
      panoramaRetryInterval = null
      panoramaInstance.value = new RetryStreetViewPanorama(
        element,
        buildPanoramaOptions(coord),
      )
    }, 200)
    return
  }

  clearInterval(panoramaRetryInterval)
  panoramaRetryInterval = null
  panoramaInstance.value = new StreetViewPanorama(
    element,
    buildPanoramaOptions(coord),
  )
}

function submitGuess() {
  if (!clickedPosition.value) {
    console.log('Debes hacer clic en el mapa.')
    return
  }

  emits('guessClick', clickedPosition.value)
}

function handleKeydown(event) {
  const target = event.target
  const isEditableTarget =
    target instanceof HTMLElement
    && (target.isContentEditable
      || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))

  if (event.code !== 'Space' || isEditableTarget) {
    return
  }

  event.preventDefault()
  submitGuess()
}


onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  const checkMap = setInterval(() => {
    const map = googleMapComponent.value?.map
    if (map) {
      clearInterval(checkMap)
      mapInstance.value = map
      applyMinimapRestriction(map)
      drawBoundaryMask(map)

      map.addListener('click', (event) => {
        const nextPosition = event.latLng.toJSON()

        if (!isWithinProvinceBoundary(nextPosition)) {
          return
        }

        clickedPosition.value = nextPosition

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

onBeforeUnmount(() => {
  clearInterval(panoramaRetryInterval)
  window.removeEventListener('keydown', handleKeydown)
  boundaryMask.value?.setMap(null)
})

</script>

<template>
  <div class="relative z-0" style="width: 100%; height: 100vh">
    <div ref="streetViewElement" style="width: 100%; height: 100vh"></div>
    <StreetViewMiniMap
      v-model:google-map-component="googleMapComponent"
      :api-key="apiKey"
      :center="centerMinimap"
      :outline="provinceOutline"
      :round="round"
      :score="score"
      :can-return-to-start="gamemode !== 'Sin movimiento'"
      @submit-guess="submitGuess"
      @return-to-start="$emit('returnToStart')"
    />
  </div>

</template>
