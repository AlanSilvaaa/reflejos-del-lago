<script setup>
import Button from 'primevue/button'

defineProps({
  canReturnToStart: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['backToMenu', 'returnToStart'])
</script>

<template>
  <div class="absolute left-4 top-4 z-[100]">
    <Button
      icon="pi pi-times"
      severity="danger"
      rounded
      text
      aria-label="Cerrar"
      :pt="{
        root: { style: { backgroundColor: 'white' } },
      }"
      @click="$emit('backToMenu')"
    />
  </div>

  <div
    v-if="canReturnToStart"
    class="absolute bottom-2 left-1/2 z-50 -translate-x-1/2"
  >
    <Button
      severity="warning"
      raised
      class="text-sm px-4 py-2"
      @click="$emit('returnToStart')"
    >
      Volver al Inicio
    </Button>
  </div>
</template>
