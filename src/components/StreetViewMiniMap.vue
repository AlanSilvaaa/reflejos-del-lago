<script setup>
import { GoogleMap, Polygon } from 'vue3-google-map'
import Button from 'primevue/button'

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
})

const googleMapComponent = defineModel('googleMapComponent')

defineEmits(['submitGuess'])
</script>

<template>
  <div
    class="absolute bottom-0 right-0 z-10 h-[250px] w-[30%] opacity-50 transition-all duration-300 hover:h-[300px] hover:w-[40%] hover:opacity-100"
  >
    <GoogleMap
      ref="googleMapComponent"
      :api-key="apiKey"
      :libraries="['places', 'marker']"
      style="height: 300px;"
      :center="center"
      :zoom="7"
      :disable-default-ui="true"
    >
      <Polygon v-for="(opts, idx) in outline" :key="idx" :options="opts" />
    </GoogleMap>

    <div class="absolute bottom-2 left-1/2 z-50 -translate-x-1/2 transform">
      <Button severity="success" raised class="text-sm px-4 py-2" @click="$emit('submitGuess')">
        Adivinar
      </Button>
    </div>
  </div>
</template>
