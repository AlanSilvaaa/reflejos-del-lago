<script setup>
import { GoogleMap, AdvancedMarker, Polyline, Polygon } from 'vue3-google-map'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProvinciaDeLlanquihue from '@/data/boundaries/ProvinciaDeLlanquihue.json'

const ProvinciaDeLlanquihueOutline = ProvinciaDeLlanquihue.map((ring) => ({
  paths: ring,
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
  fillOpacity: 0,
  clickable: false
}))

const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY
const mapId = process.env.VUE_APP_GOOGLE_MAP_ID
const route = useRoute()
const router = useRouter()

const miniLat = parseFloat(route.query.miniLat)
const miniLng = parseFloat(route.query.miniLng)
const realLat = parseFloat(route.query.realLat)
const realLng = parseFloat(route.query.realLng)
let round = parseFloat(route.query.round)
let meters = ref(parseFloat(route.query.meters) || 0);
let sum_score = ref(parseFloat(route.query.score) || 0)

console.log("Round value in Gmaps: " + round)

const Minimapa = { lat: miniLat, lng: miniLng }
const Coordenadas_Real = { lat: realLat, lng: realLng }

const center = { lat: realLat, lng: realLng }

const line_coordinates = [
  { lat: miniLat, lng: miniLng },
  { lat: realLat, lng: realLng },
]

const line_properties = {
  path: line_coordinates,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2,
}

function haversineDistance(miniLat, miniLng, realLat, realLng) {
  const R = 6371000 // radio de la Tierra en metros
  const toRadians = deg => deg * (Math.PI / 180)

  const dLat = toRadians(realLat - miniLat)
  const dLon = toRadians(realLng - miniLng)

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(miniLat)) * Math.cos(toRadians(realLat)) *
    Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

const Distance = computed(() => {
  return haversineDistance(miniLat, miniLng, realLat, realLng).toFixed(2)
})


const Score = computed(() => {
  const distance = parseFloat(Distance.value);
  const maxScore = 5000;
  const threshold = 50;
  const k = 0.0005;

  if (typeof distance !== 'number' || isNaN(distance)) return 0;
  if (distance <= threshold) return maxScore;

  const adjustedDistance = distance - threshold;
  const score = maxScore * Math.exp(-k * adjustedDistance);
  return Math.round(score);
});

onMounted(() => {
  meters.value += Number(Distance.value)
  sum_score.value += Score.value;
})

function NextRound() {
  router.push({
    path: "/PlayGame",
    query: {
      round: round + 1,
      gamemode: route.query.gamemode,
      used: route.query.used,
      meters: meters.value.toFixed(2),
      score: sum_score.value.toFixed(0)
    }
  })
}

function PlayAgain() {
  round = 0
  router.push({
    path: "/PlayGame",
    query: {
      gamemode: route.query.gamemode
    }
  })
}
const DisplayResults = ref(false)
function DResults() {
  DisplayResults.value = true
}

function BackMenu() {
  router.push({
    path: "/",
  })
}

const formattedDistance = computed(() => {
  const value = meters.value;
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kilómetros`;
  } else {
    return `${value.toFixed(2)} metros`;
  }
});

</script>

<template>
  <div class="relative z-0">
    <GoogleMap :api-key="apiKey" :map-id="mapId" style="width: 100%; height: 100vh" :libraries="['marker']"
      :center="center" :zoom="12" :disable-default-ui="true">
      <AdvancedMarker :options="{ position: Minimapa }"
        :pin-options="{ background: '#2b4cf0', borderColor: '#000000', glyph: '📍' }" />
      <AdvancedMarker :options="{ position: Coordenadas_Real }"
        :pin-options="{ background: '#2bf060', borderColor: '#000000', glyph: '✅' }" />
      <Polyline :options="line_properties" />
      <Polygon v-for="(opts, idx) in ProvinciaDeLlanquihueOutline" :key="idx" :options="opts" />
    </GoogleMap>
    <div :style="{
      position: 'absolute',
      padding: '1rem',
      top: '16px',
      left: '16px',
      zIndex: 10
    }">
      <Card :pt="{
        root: { style: { backgroundColor: 'white', color: 'green' } },
        content: { style: { backgroundColor: 'white', color: 'green' } }
      }">
        <template #title>Puntaje</template>
        <template #content>
          <p class="m-0">Distancia: {{ Distance }}</p>
          <p class="m-0">Punateje Ronda: {{ Score }}</p>
        </template>
      </Card>
    </div>
    <div :style="{
      position: 'absolute',
      padding: '1rem',
      top: '16px',
      right: '16px',
      zIndex: 10
    }">
      <Card :pt="{
        root: { style: { backgroundColor: 'white', color: 'green' } },
        content: { style: { backgroundColor: 'white', color: 'green' } }
      }">
        <template #content>
          <p class="m-0">Coordenada original: ✅</p>
          <p class="m-0">Tu respuesta: 📍</p>
        </template>
      </Card>
    </div>
    <div :style="{
      position: 'absolute',
      padding: '1rem',
      top: '160px',
      left: '14px',
      zIndex: 10
    }">
      <Button label="Siguiente Ronda" @click="NextRound" v-if="round < 3" raised></Button>
      <Button label="Ver Resultados" @click="DResults" v-else raised></Button>
    </div>
    <div v-if="DisplayResults" :style="{
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.8)',
      zIndex: 20
    }">
      <Card style="width: 300px" :pt="{
        root: { style: { backgroundColor: 'white', color: 'orange' } },
        content: { style: { backgroundColor: 'white', color: 'orange' } }
      }">
        <template #title>Resultados Finales</template>
        <template #content>
          <p>{{ formattedDistance }}</p>
          <p>Puntaje total: {{ sum_score }}</p>
          <p>Resultados calculados localmente en esta sesion.</p>
          <div>
            <Button label="Volver a jugar" @click="PlayAgain" style="margin-top: 1rem; width: 100%;"></Button>
            <Button label="Volver al menú" @click="BackMenu" style="margin-top: 1rem; width: 100%;"></Button>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
