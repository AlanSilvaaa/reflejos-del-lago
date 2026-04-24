<script setup>
import { GoogleMap, Polygon } from 'vue3-google-map'
import PuertoVaras from '@/data/boundaries/PuertoVaras.json'
import Llanquihue from '@/data/boundaries/Llanquihue.json'
import Frutillar from '@/data/boundaries/Frutillar.json'
import LosMuermos from '@/data/boundaries/LosMuermos.json'
import Maullin from '@/data/boundaries/Maullin.json'
import PuertoMontt from '@/data/boundaries/PuertoMontt.json'
import Calbuco from '@/data/boundaries/Calbuco.json'
import Cochamo from '@/data/boundaries/Cochamo.json'
import Fresia from '@/data/boundaries/Fresia.json'

const api_key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const center = { lat: -41.471798, lng: -72.9395915 }

const PuertoVarasOutline = PuertoVaras.map((ring) => ({
  paths: ring,
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
  fillOpacity: 0.35
}))

const LlanquihueOutline = Llanquihue.map((ring) => ({
  paths: ring,
  strokeColor: '#0389AB',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#0389AB',
  fillOpacity: 0.35,
}))

const LosMuermosOutline = LosMuermos.map((ring) => ({
  paths: ring,
  strokeColor: '#0000FF',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#0000FF',
  fillOpacity: 0.35
}))

const FrutillarOutline = Frutillar.map((ring) => ({
  paths: ring,
  strokeColor: '#e38010',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#e38010',
  fillOpacity: 0.35,
}))

const MaullinOutline = Maullin.map((ring) => ({
  paths: ring,
  strokeColor: '#9258bf',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#9258bf',
  fillOpacity: 0.35,
}))

const PuertoMonttOutline = PuertoMontt.map((ring) => ({
  paths: ring,
  strokeColor: '#9e3980',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#9e3980',
  fillOpacity: 0.35,
}))

const CalbucoOutline = Calbuco.map((ring) => ({
  paths: ring,
  strokeColor: '#1fcf74',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#1fcf74',
  fillOpacity: 0.35,
}))

const CochamoOutline = Cochamo.map((ring) => ({
  paths: ring,
  strokeColor: '#044e69',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#044e69',
  fillOpacity: 0.35,
}))

const FresiaOutline = Fresia.map((ring) => ({
  paths: ring,
  strokeColor: '#ff00f7',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#ff00f7',
  fillOpacity: 0.35,
}))

</script>

<template>
  <GoogleMap :api-key="api_key" :disable-default-ui="true" style="width: 100%; height: 100%" :center="center" :zoom="7">
    <Polygon v-for="(opts, idx) in PuertoVarasOutline" :key="idx" :options="opts" @mouseover="(e, poly) => console.log('this is e: ', e, 'and this poly: ', poly)"/>
    <Polygon v-for="(opts, idx) in FrutillarOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in LlanquihueOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in MaullinOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in LosMuermosOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in PuertoMonttOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in CalbucoOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in CochamoOutline" :key="idx" :options="opts" />
    <Polygon v-for="(opts, idx) in FresiaOutline" :key="idx" :options="opts" />
  </GoogleMap>
</template>
