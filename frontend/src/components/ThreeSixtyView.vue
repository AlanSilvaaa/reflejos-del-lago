<template>
  <View360
    v-if="imgExists"
    :projection="projection"
    :rotate="false"
    :autoplay="{ 
      speed: 0.4,
      delay: 0,
      pauseOnHover: false
    }"
    canvasClass="w-full h-full"
  />
</template>

<script setup>
import { View360, EquirectProjection } from "@egjs/vue3-view360";
import { defineProps, ref, onMounted } from "vue";

const props = defineProps({
  image: String,
});

const imgExists = ref(false);

const backgroundImages = import.meta.glob('@/assets/images/backgrounds/*.jpg', {
  eager: true,
  import: 'default'
});

const imageSrc = backgroundImages[`/src/assets/images/backgrounds/${props.image}.jpg`];

const projection = new EquirectProjection({ src: imageSrc });

onMounted(() => {
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => (imgExists.value = true);
  img.onerror = () => {
    imgExists.value = false;
    console.error(`Image not found: ${imageSrc}`);
  };
});
</script>
