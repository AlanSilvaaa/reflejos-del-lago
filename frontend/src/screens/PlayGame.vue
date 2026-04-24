<script setup>
import StreetView from '@/components/StreetView.vue'
import GameStatusBar from '@/components/GameStatusBar.vue'
import GameControls from '@/components/GameControls.vue'
import TimeExpiredOverlay from '@/components/TimeExpiredOverlay.vue'
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRandomNode } from '@/services/reflejosDb'


const router = useRouter()
const route = useRoute()

const round = ref(parseInt(route.query.round) || 1)
const gamemode = ref(route.query.gamemode || 'Normal')
const usedNodeIds = ref([])
const initialCoord = ref(null)
const reloadCounter = ref(0)
const timeExpired = ref(false)
const meters = ref(parseFloat(route.query.meters) || 0)
const score = ref(parseFloat(route.query.score) || 0)


const countdown = ref(180)
let countdownInterval = null
const timeoutId = ref(null)

if (route.query.used) {
    try {
        usedNodeIds.value = JSON.parse(route.query.used)
    } catch (e) {
        console.error('Error al parsear ids usados:', e)
    }
}

const realCoord = ref({ lat: 0, lng: 0 })

async function fetchRandomCoord() {
    try {
        const coord = await getRandomNode(usedNodeIds.value)

        realCoord.value = coord
        if (!initialCoord.value) {
            initialCoord.value = { ...coord }
        }
        usedNodeIds.value.push(coord.id)
    } catch (error) {
        console.error('Fetch coordinates from local SQLite failed', error)
    }
}

onMounted(() => {
    updateRealCoordFromQuery()
})

watch(() => route.query, () => {
    updateRealCoordFromQuery()
})

function updateRealCoordFromQuery() {
    const lat = parseFloat(route.query.initialLat)
    const lng = parseFloat(route.query.initialLng)

    if (!isNaN(lat) && !isNaN(lng)) {
        realCoord.value = { lat, lng }
        if (!initialCoord.value) {
        initialCoord.value = { lat, lng }
        }
    } else {
        fetchRandomCoord()
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
            used: JSON.stringify(usedNodeIds.value),
            meters: meters.value.toFixed(2),
            score: score.value.toFixed(0)
            },
    })
}

function redirectToInitial() {
    if (!initialCoord.value) {
        console.warn('Coordenada inicial no está definida')
        return
    }
    reloadCounter.value++

    router.replace({
        path: '/PlayGame',
        query: {
            round: round.value,
            gamemode: gamemode.value,
            used: JSON.stringify(usedNodeIds.value),
            initialLat: initialCoord.value.lat,
            initialLng: initialCoord.value.lng,
            reload: reloadCounter.value,
        },
    })
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
        gamemode: gamemode.value,
        },
    })
}


function BackToMenu() {
    router.push({
        path: '/',
    })
}

</script>

<template>
    <div class="relative h-screen w-full">
        <StreetView :gamemode="gamemode" :realCoord="realCoord" @guessClick="handleGuessClick" />

        <GameControls
            :can-return-to-start="gamemode !== 'Sin movimiento'"
            @back-to-menu="BackToMenu"
            @return-to-start="redirectToInitial"
        />

        <GameStatusBar :round="round" :score="score" :countdown="countdown" />

        <TimeExpiredOverlay
            :visible="timeExpired"
            @play-again="PlayAgain"
            @back-to-menu="BackToMenu"
        />
    </div>
</template>
