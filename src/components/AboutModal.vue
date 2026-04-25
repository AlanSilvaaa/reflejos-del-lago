<template>
    <Dialog
        v-model:visible="visibleModel"
        modal
        :draggable="false"
        header="Información"
        :style="{ width: 'min(1100px, 92vw)' }"
        :contentStyle="{ paddingBottom: '0' }"
    >
        <div class="mx-auto w-full max-w-6xl px-4 lg:px-8">
            <div class="grid grid-cols-1 gap-6 items-start lg:grid-cols-[25rem_minmax(0,1fr)]">
                <Card style="width: 25rem; overflow: hidden">
                    <template #header>
                        <div class="h-96 w-96">
                            <ProvinceOfLlanquihue></ProvinceOfLlanquihue>
                        </div>
                    </template>
                </Card>

                <section class="rounded-xl bg-white/5 p-6 text-slate-100">
                    <h2 class="mb-4 text-2xl font-semibold">Acerca del proyecto</h2>
                    <p class="m-0 leading-8 text-slate-300">
                        Reflejos del lago nace del objetivo de crear un juego para la asignatura <strong>Aplicaciones y tecnologías de la web</strong>.
                    </p>
                    <p class="m-0 leading-8 text-slate-300">
                    <br>
                    Basado en Geoguessr, el juego se centra en la provincia de Llanquihue, Chile, y busca ofrecer una experiencia educativa y entretenida para los jugadores.
                    </p>
                    <p class="m-0 leading-8 text-slate-300">
                    <br>
                    El proyecto es de código abierto y puede ser encontrado
                    <a
                            href="https://github.com/AlanSilvaaa/reflejos-del-lago"
                        target="_blank"
                        rel="noreferrer"
                        class="font-semibold text-slate-300 hover:text-slate-200 underline"
                    >
                        aquí
                        </a>
                    .</p>
                    <footer>
                        <small class="text-slate-500">
                            versión {{ appVersion }} - {{ formattedReleaseDate }}
                        </small>
                    </footer>
                </section>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';

import ProvinceOfLlanquihue from '@/components/ProvinceOfLlanquihue.vue';

const appVersion = __APP_VERSION__;
const formattedReleaseDate = new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}).format(new Date(`${__APP_RELEASE_DATE__}T00:00:00`));

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:visible']);

const visibleModel = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
});
</script>
