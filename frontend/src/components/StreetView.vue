<script setup>
/* global google */
import { onMounted, ref, watch } from "vue";
import { GoogleMap, Polygon } from 'vue3-google-map';
import Button from 'primevue/button';
import ProvinciaDeLlanquihue from '@/data/boundaries/ProvinciaDeLlanquihue.json'

const props = defineProps({
  gamemode: String,
  realCoord: Object
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
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const center_minimap = { lat: -41.333333333333, lng: -72.833333333333 };
const mapInstance = ref(null)
const marker = ref(null)
const googleMapComponent = ref(null)

console.log("Coordenadas obtenidas", props.realCoord)

const panoramaInstance = ref(null);

console.log("Modo de juego escogido: ", props.gamemode);

if (props.gamemode === "Sin movimiento"){
  watch(
    () => props.realCoord,
    (coord) => {
      if (coord.lat !== 0 && coord.lng !== 0 && window.google) {
        console.log("Configurando Street View con:", coord);
        panoramaInstance.value = new google.maps.StreetViewPanorama(
          document.getElementById("street-view"),
          {
            position: coord,
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            addressControl: false,
            disableDefaultUI: true,
            showRoadLabels: false,
            clickToGo: false,
            linksControl: false,
            panControl: false
          }
        );
      }
    },
    { immediate: true }
  );
}
else {
  watch(
    () => props.realCoord,
    (coord) => {
      if (coord.lat !== 0 && coord.lng !== 0 && window.google) {
        console.log("Configurando Street View con:", coord);
        panoramaInstance.value = new google.maps.StreetViewPanorama(
          document.getElementById("street-view"),
          {
            position: coord,
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            addressControl: false,
            disableDefaultUI: true,
            showRoadLabels: false
          }
        );
      }
    },
    { immediate: true }
  );
}


const opacityValue = ref(0.5);
const heightValue = ref("250px");
const widthValue = ref("30%");

function mouseEnterMiniMap() {
  widthValue.value = "40%";
  heightValue.value = "300px";
  opacityValue.value = 1;
}

function mouseLeaveMiniMap() {
  widthValue.value = "30%";
  heightValue.value = "250px";
  opacityValue.value = 0.5;
}

function submitGuess() {
  if (!clickedPosition.value) {
    alert("Debes hacer clic en el mapa.");
    return;
  }

  emits("guessClick", clickedPosition.value);
}


onMounted(() => {
  const checkMap = setInterval(() => {
    const map = googleMapComponent.value?.map
    if (map) {
      clearInterval(checkMap)
      mapInstance.value = map
      console.log("Mapa cargado:", map)

      map.addListener("click", (event) => {
        clickedPosition.value = event.latLng.toJSON();
        console.log("Click detectado en:", event.latLng.toJSON())

        if (marker.value) {
          marker.value.setMap(null)
        }

        marker.value = new google.maps.Marker({
          position: event.latLng,
          map: map,
        });
      })
    }
  }, 200)
})

</script>

<template>
  <div class="relative z-0" id="street-view" style="width: 100%; height: 100vh">
    <div
      id="mapa" 
      :style="{
      position: 'absolute',
      right: '0',
      bottom: '0',
      width: widthValue,
      height: heightValue,
      opacity: opacityValue,
      zIndex: 10,
      transition: 'width 0.3s, height 0.3s, opacity 0.3s'}" 
      @mouseenter="mouseEnterMiniMap" 
      @mouseleave="mouseLeaveMiniMap">
      <GoogleMap
        ref="googleMapComponent"
        :api-key= apiKey
        style="height: 300px;"
        :center= center_minimap
        :zoom="7"
        :disable-default-ui="true"
      >
          <Polygon v-for="(opts, idx) in ProvinciaDeLlanquihueOutline" :key="idx" :options="opts" />
      </GoogleMap>
      <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-50">
        <Button @click="submitGuess" severity="success" raised class="text-sm px-4 py-2">
          Adivinar
        </Button>
      </div>
    </div>
  </div>

</template>
