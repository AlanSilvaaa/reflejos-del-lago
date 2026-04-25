<template>
    <!-- Polaroid container with 360° background -->
    <div class="relative min-h-screen">

        <!-- 360° background -->
        <ThreeSixtyView v-if="show360" image="example4" :style="threeSixtyStyle" />
        <Button
            icon="pi pi-info-circle"
            rounded
            text
            severity="contrast"
            aria-label="Información"
            :style="infoButtonStyle"
            @click="showInfoModal = true"
        />
        <div
            class="relative z-10 bg-transparent px-8 text-center"
            :style="heroContentStyle"
        >
            <div :style="heroBlockStyle">
                <img src="../assets/images/logo.png" alt="logo" class="h-32 w-auto mx-auto" />
                <p class="mt-4 text-white font-minecraft">
                    ¿Qué tanto conoces a la provincia de Llanquihue?
                </p>
                <GameModes class="mt-7" />
            </div>
        </div>
        <p class="absolute bottom-3 left-1/2 z-10 m-0 -translate-x-1/2 text-center text-xs text-slate-200">
            un juego desarrollado por
            <a
                href="https://github.com/AlanSilvaaa"
                target="_blank"
                rel="noreferrer"
                class="font-semibold text-slate-300 hover:text-slate-200"
            >
                AlanSilvaaa
            </a>
            y
            <a
                href="https://github.com/Vinbu"
                target="_blank"
                rel="noreferrer"
                class="font-semibold text-slate-300 hover:text-slate-200"
            >
                Vinbu
            </a>
        </p>
    </div>

    <AboutModal v-model:visible="showInfoModal" />

</template>

<script setup>
import GameModes from '@/components/GameModes.vue';
import Button from 'primevue/button';
import { defineAsyncComponent } from 'vue';
import { ref, onMounted, nextTick  } from 'vue';
import AboutModal from '@/components/AboutModal.vue';

const ThreeSixtyView = defineAsyncComponent(() => import('../components/ThreeSixtyView.vue'));
const show360 = ref(false);
const showInfoModal = ref(false);
const threeSixtyStyle = {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    opacity: '0.5',
    pointerEvents: 'none',
};
const infoButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: '20',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
};
const heroContentStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
};
const heroBlockStyle = {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};
onMounted(async () => {
    await nextTick();

    setTimeout(() => {
        show360.value = true;
    }, 300);
});

</script>
