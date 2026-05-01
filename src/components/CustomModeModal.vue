<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :draggable="false"
    header="Modo personalizado"
    :style="{ width: 'min(1180px, 94vw)' }"
  >
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section class="rounded-[1.75rem] bg-white/5 p-4 text-slate-100">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="m-0 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-slate-400">Municipalidades</p>
            <h2 class="m-0 mt-1 text-lg font-semibold text-white">Selecciona el área de juego</h2>
          </div>
          <Tag rounded severity="secondary" :value="`${selectedMunicipalities.length} seleccionadas`" />
        </div>

        <div class="mb-4">
          <MultiSelect
            v-model="selectedMunicipalities"
            :options="municipalityOptions"
            optionLabel="label"
            optionValue="value"
            display="chip"
            filter
            fluid
            placeholder="Elige una o mas municipalidades"
            :maxSelectedLabels="3"
          />
        </div>

        <div class="h-[24rem] overflow-hidden rounded-[1.5rem]">
          <ProvinceOfLlanquihue
            :selected-municipalities="selectedMunicipalities"
            selectable
            @toggle-municipality="toggleMunicipality"
          />
        </div>

        <p class="mb-0 mt-3 text-sm leading-6 text-slate-400">
          El mapa muestra todas las comunas con un color tenue. Al seleccionarlas desde el mapa o el selector superior, su color se intensifica.
        </p>
      </section>

      <section class="rounded-[1.75rem] bg-white/5 p-5 text-slate-100">
        <p class="m-0 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-slate-400">Reglas</p>
        <h2 class="m-0 mt-1 text-lg font-semibold text-white">Ajusta tu partida</h2>

        <div class="mt-5 space-y-5">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-200">Numero de rondas</label>
            <InputNumber v-model="rounds" fluid :min="1" :max="20" showButtons buttonLayout="horizontal" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-200">Tiempo por ronda</label>
            <InputNumber
              v-model="timePerRoundDisplay"
              fluid
              :min="timePerRoundUnit === 's' ? 30 : 1"
              :max="timePerRoundUnit === 's' ? 59 : 15"
              :step="timePerRoundUnit === 's' ? 30 : 0.5"
              :suffix="timePerRoundUnit === 's' ? ' s' : ' min'"
              :minFractionDigits="timePerRoundUnit === 's' ? 0 : 0"
              :maxFractionDigits="timePerRoundUnit === 's' ? 0 : 1"
              showButtons
              buttonLayout="horizontal"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-200">Dificultad</label>
            <SelectButton
              v-model="difficulty"
              :options="CUSTOM_DIFFICULTY_OPTIONS"
              optionLabel="label"
              optionValue="value"
              fluid
              class="w-full"
              :pt="{
                root: { class: 'w-full' },
                pcToggleButton: {
                  root: { class: 'flex-1' },
                },
              }"
            />
          </div>

          <div class="flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <p class="m-0 text-sm font-medium text-slate-100">Deshabilitar movimiento</p>
              <small class="text-slate-400">Mantiene la camara fija en el punto inicial.</small>
            </div>
            <ToggleSwitch v-model="disableMovement" />
          </div>
        </div>

        <div class="mt-6 p-1 text-sm leading-6 text-slate-300">
          <p class="m-0">La dificultad se basa en la distancia del punto seleccionado respecto al centro de su municipalidad.</p>
        </div>

        <div class="mt-6 flex gap-3">
          <Button
            label="Cancelar"
            rounded
            severity="secondary"
            class="flex-1"
            :pt="{
              root: { class: 'shadow-none' },
              label: { class: 'font-semibold' },
            }"
            @click="visibleModel = false"
          />
          <Button
            label="Jugar"
            rounded
            class="flex-1"
            :disabled="selectedMunicipalities.length === 0"
            :pt="{
              root: { class: 'border-0 bg-emerald-400 text-slate-950 shadow-none hover:bg-emerald-300 disabled:opacity-50' },
              label: { class: 'font-semibold' },
            }"
            @click="startGame"
          />
        </div>
      </section>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import ProvinceOfLlanquihue from '@/components/ProvinceOfLlanquihue.vue'
import { MUNICIPALITY_OPTIONS } from '@/data/municipalities'
import { getMunicipalities } from '@/services/reflejosDb'
import {
  CUSTOM_DIFFICULTY_OPTIONS,
  DEFAULT_CUSTOM_GAME_SETTINGS,
  normalizeCustomGameSettings,
  type CustomGameSettings,
  type DifficultyLevel,
} from '@/types/customGame'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  start: [settings: CustomGameSettings]
}>()

const municipalityOptions = ref(MUNICIPALITY_OPTIONS)
const rounds = ref(DEFAULT_CUSTOM_GAME_SETTINGS.rounds)
const selectedMunicipalities = ref<string[]>([])
const timePerRound = ref(DEFAULT_CUSTOM_GAME_SETTINGS.timePerRound)
const disableMovement = ref(DEFAULT_CUSTOM_GAME_SETTINGS.disableMovement)
const difficulty = ref<DifficultyLevel>(DEFAULT_CUSTOM_GAME_SETTINGS.difficulty)

const visibleModel = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

const timePerRoundUnit = computed(() => (timePerRound.value < 60 ? 's' : 'min'))

const timePerRoundDisplay = computed({
  get: () => (timePerRound.value < 60 ? timePerRound.value : timePerRound.value / 60),
  set: (value: number | null) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return
    }

    timePerRound.value = timePerRoundUnit.value === 's'
      ? value
      : Math.round(value * 60)
  },
})

onMounted(async () => {
  try {
    const municipalities = await getMunicipalities()
    municipalityOptions.value = municipalities.map((name) => ({ label: name, value: name }))
  } catch (error) {
    console.error('Failed to load municipalities', error)
  }
})

function toggleMunicipality(name: string) {
  selectedMunicipalities.value = selectedMunicipalities.value.includes(name)
    ? selectedMunicipalities.value.filter((entry) => entry !== name)
    : [...selectedMunicipalities.value, name]
}

function startGame() {
  const settings = normalizeCustomGameSettings({
    rounds: rounds.value,
    municipalities: selectedMunicipalities.value,
    timePerRound: timePerRound.value,
    disableMovement: disableMovement.value,
    difficulty: difficulty.value,
  })

  emit('start', settings)
  visibleModel.value = false
}
</script>
