<script setup>
import StreetView from '@/components/StreetView.vue';
import { ref, onMounted, watch, onBeforeUnmount  } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRandomNode } from '@/services/reflejosDb';
import Button from 'primevue/button';


const router = useRouter();
const route = useRoute();

const round = ref(parseInt(route.query.round) || 1);
const gamemode = ref(route.query.gamemode || "Normal");
const usedCoords = ref([]);
const initialCoord = ref(null);
const reloadCounter = ref(0);
const timeExpired = ref(false)
const meters = ref(parseFloat(route.query.meters) || 0);
const score = ref(parseFloat(route.query.score) || 0); 


const countdown = ref(180)
let countdownInterval = null
const timeoutId = ref(null)

if (route.query.used) {
    try {
        usedCoords.value = JSON.parse(route.query.used);
    } catch (e) {
        console.error("Error al parsear coordenadas usadas:", e);
    }
}

const realCoord = ref({ lat: 0, lng: 0 });

async function fetchRandomCoord() {
    try {
        const coord = await getRandomNode(usedCoords.value);

        realCoord.value = coord;
        if (!initialCoord.value) {
            initialCoord.value = { ...coord };
        }
        usedCoords.value.push({ lat: coord.lat, lng: coord.lng });
    } catch (error) {
        console.error("Fetch coordinates from local SQLite failed", error);
    }
}

onMounted(() => {
    updateRealCoordFromQuery();
});

watch(() => route.query, () => {
    updateRealCoordFromQuery();
});

function updateRealCoordFromQuery() {
    const lat = parseFloat(route.query.initialLat);
    const lng = parseFloat(route.query.initialLng);

    if (!isNaN(lat) && !isNaN(lng)) {
        realCoord.value = { lat, lng };
        if (!initialCoord.value) {
        initialCoord.value = { lat, lng };
        }
    } else {
        fetchRandomCoord();
    }
}



function handleGuessClick(position) {
    router.push({
        path: '/ResultsScreen',
        query: {
            miniLat: position.lat,
            miniLng: position.lng,
            realLat: realCoord.value.lat,
            realLng: realCoord.value.lng,
            round: round.value,
            gamemode: gamemode.value,
            used: JSON.stringify(usedCoords.value),
            meters: meters.value.toFixed(2),
            score: score.value.toFixed(0)
            }
    });
}

function redirectToInitial() {
    if (!initialCoord.value) {
        console.warn("Coordenada inicial no está definida");
        return;
    }
    reloadCounter.value++;

    router.replace({
        path: '/PlayGame',
        query: {
            round: round.value,
            gamemode: gamemode.value,
            used: JSON.stringify(usedCoords.value),
            initialLat: initialCoord.value.lat,
            initialLng: initialCoord.value.lng,
            reload: reloadCounter.value
        }
    });
}

function startCountdown() {
    clearInterval(countdownInterval)
    clearTimeout(timeoutId.value)

    countdown.value = 180

    countdownInterval = setInterval(() => {
        if (countdown.value > 0) {
        countdown.value--
        }
    }, 1000)

    timeoutId.value = setTimeout(() => {
        timeExpired.value = true
        clearInterval(countdownInterval)
    }, 180000)
    }

    onMounted(() => {
    startCountdown()
    })

    onBeforeUnmount(() => {
    clearInterval(countdownInterval)
    clearTimeout(timeoutId.value)
})

function PlayAgain() {
    timeExpired.value = false
    countdown.value = 180
    clearInterval(countdownInterval)
    clearTimeout(timeoutId.value)
    fetchRandomCoord()
    startCountdown()

    router.replace({
        path: '/PlayGame',
        query: {
        gamemode: gamemode.value
        }
    })
}


function BackToMenu() {
    router.push({
        path: "/"
    });
}

</script>

<template>
    <div
        :style="{
        position: 'relative',
        height: '100vh',
        width: '100%'
        }"
    >
        <StreetView :gamemode="gamemode" :realCoord="realCoord" @guessClick="handleGuessClick" />

        <div
        v-if="gamemode !== 'Sin movimiento'"
        :style="{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50
        }"
        >
        <Button
            @click="redirectToInitial"
            severity="warning"
            raised
            class="text-sm px-4 py-2"
        >
            Volver al Inicio
        </Button>
        </div>
        <div
        :style="{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 100
        }"
        >
        <Button
            :style="{
            backgroundColor: 'white'}"
            icon="pi pi-times"
            severity="danger"
            rounded
            text
            @click="BackToMenu"
            aria-label="Cerrar"
        ></Button>
        </div>

        <div
        :style="{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            backgroundColor: 'white',
            opacity: 0.85,
            padding: '6px 12px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontWeight: '600',
            color: 'black'
        }"
        >
        Ronda: {{ round }}
        </div>
        <div
        :style="{
            position: 'absolute',
            top: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            backgroundColor: 'white',
            opacity: 0.85,
            padding: '6px 12px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontWeight: '600',
            color: 'black'
        }"
        >
        Tiempo restante: {{ Math.floor(countdown / 60) }}:{{ (countdown % 60).toString().padStart(2, '0') }}
        </div>
        <div v-if="timeExpired" :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            zIndex: 1000
        }">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">¡Se acabó el tiempo!</div>
            <div style="font-size: 18px; margin-bottom: 30px;">Has perdido esta ronda.</div>
            <Button label="Volver a jugar" @click="PlayAgain" class="mb-2"></Button>
            <Button label="Volver al menú" @click="BackToMenu" ></Button>
        </div>

    </div>
</template>
