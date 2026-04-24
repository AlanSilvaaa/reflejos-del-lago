<script setup>
import Card from 'primevue/card'
import Button from 'primevue/button'

defineProps({
  distance: {
    type: String,
    required: true,
  },
  roundScore: {
    type: Number,
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  isLastRound: {
    type: Boolean,
    default: false,
  },
  showFinalResults: {
    type: Boolean,
    default: false,
  },
  formattedTotalDistance: {
    type: String,
    required: true,
  },
})

defineEmits(['nextRound', 'showFinalResults', 'playAgain', 'backToMenu'])

const resultCardPt = {
  root: { style: { backgroundColor: 'white', color: 'green' } },
  content: { style: { backgroundColor: 'white', color: 'green' } },
}

const finalCardPt = {
  root: { style: { backgroundColor: 'white', color: 'orange' } },
  content: { style: { backgroundColor: 'white', color: 'orange' } },
}
</script>

<template>
  <div class="absolute left-4 top-4 z-10 flex max-w-sm flex-col gap-4">
    <Card :pt="resultCardPt">
      <template #title>Resumen de la ronda</template>
      <template #content>
        <p class="m-0">Ronda: {{ round }}</p>
        <p class="m-0">Distancia: {{ distance }}</p>
        <p class="m-0">Puntaje ronda: {{ roundScore }}</p>
        <p class="m-0">Puntaje total: {{ totalScore }}</p>
      </template>
    </Card>

    <Card :pt="resultCardPt">
      <template #title>Leyenda</template>
      <template #content>
        <p class="m-0">Coordenada original: ✅</p>
        <p class="m-0">Tu respuesta: 📍</p>
      </template>
    </Card>

    <div>
      <Button
        v-if="!isLastRound"
        label="Siguiente Ronda"
        raised
        @click="$emit('nextRound')"
      />
      <Button
        v-else
        label="Ver Resultados"
        raised
        @click="$emit('showFinalResults')"
      />
    </div>
  </div>

  <div
    v-if="showFinalResults"
    class="absolute inset-0 z-20 flex items-center justify-center bg-white/80 px-4"
  >
    <Card style="width: 300px" :pt="finalCardPt">
      <template #title>Resultados Finales</template>
      <template #content>
        <p>{{ formattedTotalDistance }}</p>
        <p>Puntaje total: {{ totalScore }}</p>
        <p>Resultados calculados localmente en esta sesion.</p>
        <div>
          <Button label="Volver a jugar" style="margin-top: 1rem; width: 100%;" @click="$emit('playAgain')" />
          <Button label="Volver al menú" style="margin-top: 1rem; width: 100%;" @click="$emit('backToMenu')" />
        </div>
      </template>
    </Card>
  </div>
</template>
