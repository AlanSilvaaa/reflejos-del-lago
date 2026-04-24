<template>
  <!-- Card container -->
  <div class="relative w-64 h-80" style="transform-style: preserve-3d;" @mouseenter="hoverCard" @mouseleave="unhoverCard" ref="card">
    <!-- Front side -->
    <div class="absolute inset-0 bg-white shadow-lg p-4 flex flex-col justify-between"
      style="backface-visibility: hidden;">
      <img :src=front.img alt="Photo of normal mode"
        class="w-full h-64 object-cover mb-4" />
      <h1 class="text-black font-minecraft">{{ front.title }}</h1>
      <small class="text-gray-600 text-sm">{{ front.highscore }}</small>
    </div>

    <!-- Back side -->
    <div class="absolute inset-0 bg-gray-100 shadow-lg p-4 flex flex-col justify-center items-center"
      style="transform: rotateY(180deg); backface-visibility: hidden;">
      <h2 class="text-black font-minecraft mb-2">{{ back.title }}</h2>
      <p class="text-gray-700 text-center">{{ back.description }}</p>
      <ul>
        <li v-for="(rule, index) in back.rules" v-bind:key="index" class="text-gray-700">
          {{ index + 1 }}. {{ rule }}
        </li>
      </ul>
      <Button @click="handlePlayGame">Jugar</Button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, defineEmits } from 'vue';
import { useSound } from "@vueuse/sound";
import hover_card from "../assets/sounds/hover_card.wav";
import gsap from "gsap";
import { Button } from 'primevue';

const props = defineProps(["data"]);
const front = ref(props.data.front);
const back = ref(props.data.back);
const card = ref(null);
const emit = defineEmits(["playGame"]);

const { play: hoverCardSound } = useSound(hover_card, { volume: 0.5 });


function handlePlayGame() {
  emit("playGame", front.value.title);
}

function hoverCard() {
  hoverCardSound();
  gsap.to(card.value, {
    y: -30,
    duration: 0.3,
    ease: "power1.inOut",
  });
}

function unhoverCard() {
  gsap.to(card.value, {
    y: 0,
    duration: 0.3,
    ease: "power1.inOut",
  });
}
</script>

<style scoped>
</style>
