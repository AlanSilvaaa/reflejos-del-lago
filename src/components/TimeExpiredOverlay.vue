<script setup>
import Button from 'primevue/button'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['playAgain', 'backToMenu'])
</script>

<template>
  <div
    v-if="visible"
    class="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-black/80 text-white"
  >
    <div class="mb-5 text-2xl font-bold">¡Se acabó el tiempo!</div>
    <div class="mb-8 text-lg">Has perdido esta ronda.</div>
    <Button
      label="Volver a jugar"
      class="mb-2"
      :pt="{
        root: { class: 'rdl-button-primary' },
        label: { class: 'font-semibold' },
      }"
      @click="$emit('playAgain')"
    />
    <Button
      label="Volver al menú"
      :pt="{
        root: { class: 'rdl-button-secondary' },
        label: { class: 'font-semibold' },
      }"
      @click="$emit('backToMenu')"
    />
  </div>
</template>
