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
    class="absolute bottom-4 right-4 z-10 flex w-[250px] flex-col gap-3 opacity-50 transition-all duration-300 hover:w-[320px] hover:opacity-100"
  >
    <div class="aspect-square overflow-hidden rounded-md">
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
