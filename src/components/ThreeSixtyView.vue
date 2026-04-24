<script setup>
import { computed, defineProps, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { PanoViewer } from '@egjs/view360'
import example from '@/assets/images/backgrounds/example.jpg'
import example2 from '@/assets/images/backgrounds/example2.jpg'
import example3 from '@/assets/images/backgrounds/example3.jpg'
import example4 from '@/assets/images/backgrounds/example4.jpg'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  image: String,
})

const attrs = useAttrs()
const viewerContainer = ref(null)
let viewer = null
let animationFrameId = null
let previousFrameTime = null

const backgroundImages = {
  example,
  example2,
  example3,
  example4,
}

const imageSrc = computed(() => {
  return backgroundImages[props.image]
})

function stopRotation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  previousFrameTime = null
}

function startRotation() {
  stopRotation()

  const rotate = (timestamp) => {
    if (!viewer) {
      return
    }

    if (previousFrameTime !== null) {
      const elapsed = timestamp - previousFrameTime
      const yaw = viewer.getYaw() + elapsed * 0.004

      viewer.lookAt({ yaw }, 0)
    }

    previousFrameTime = timestamp
    animationFrameId = requestAnimationFrame(rotate)
  }

  animationFrameId = requestAnimationFrame(rotate)
}

function destroyViewer() {
  stopRotation()

  if (viewer) {
    viewer.destroy()
    viewer = null
  }
}

function createViewer() {
  if (!viewerContainer.value || !imageSrc.value) {
    return
  }

  destroyViewer()

  viewer = new PanoViewer(viewerContainer.value, {
    image: imageSrc.value,
    projectionType: PanoViewer.PROJECTION_TYPE.EQUIRECTANGULAR,
    gyroMode: PanoViewer.GYRO_MODE.NONE,
    useZoom: false,
    useKeyboard: false,
    yaw: 0,
    pitch: 0,
    fov: 75,
  })

  viewer.on(PanoViewer.EVENTS.READY, () => {
    viewer.keepUpdate(true)
    startRotation()
  })
}

onMounted(createViewer)

watch(imageSrc, createViewer)

onBeforeUnmount(destroyViewer)
</script>

<template>
  <div
    v-bind="attrs"
    class="three-sixty-view"
    :style="{ backgroundImage: imageSrc ? `url(${imageSrc})` : undefined }"
  >
    <div ref="viewerContainer" class="three-sixty-view__container" />
  </div>
</template>

<style>
.three-sixty-view {
  overflow: hidden;
  background-position: center;
  background-size: cover;
}

.three-sixty-view__container {
  width: 100%;
  height: 100%;
}

.three-sixty-view__container canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
