<script setup>
import Button from 'primevue/button'

defineEmits(['backToMenu'])
</script>

<template>
  <div class="absolute left-4 top-4 z-[100]">
    <Button
      icon="pi pi-home"
      rounded
      text
      severity="contrast"
      aria-label="Ir al inicio"
      :style="{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.35)' }"
      @click="$emit('backToMenu')"
    />
  </div>
</template>
