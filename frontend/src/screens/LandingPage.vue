<template>
    <!-- Polaroid container with 360° background -->
    <div class="relative min-h-screen">

        <!-- 360° background -->
        <ThreeSixtyView v-if="show360" image="example4"
            class="absolute inset-0 pointer-events-none w-full h-full opacity-50" />
        <!-- HEADER: top-aligned, but centered logo & text -->
        <div class="relative z-10 bg-transparent pt-8 px-8 text-center">
            <img src="../assets/images/logo.png" alt="logo" class="h-32 w-auto mx-auto" />
            <p class="mt-4 text-white font-minecraft">
                ¿Qué tanto conoces sobre la provincia de Llanquihue?
            </p>
            <GameModes class="mt-7" />
        </div>
    </div>

    <!-- Welcome -->
    <div class="mx-24">
        <h1 class="text-center text-4xl font-minecraft mt-4">Bienvenido</h1>
        <div class="grid grid-cols-1 gap-4 justify-items-center lg:grid-cols-2">
            <!-- First element -->
            <Card style="width: 25rem; overflow: hidden">
                <template #header>
                    <div class="h-96 w-96">
                        <ProvinceOfLlanquihue></ProvinceOfLlanquihue>
                    </div>
                    <!-- <img alt="user header" src="../assets/images/landingPage/card.jpg" /> -->
                </template>
                <template #title>Reflejos del Lago</template>
                <template #subtitle>Explora la provincia</template>
                <template #content>
                    <p class="m-0">
                        Explora la provincia de Llanquihue a través de sus paisajes. Ubicada en la región de Los Lagos,
                        Chile, esta provincia
                        es famosa por sus impresionantes vistas del Lago Llanquihue, el volcán Osorno y la
                        cordillera de los Andes.
                    </p>
                </template>
            </Card>

            <!-- Second element -->
            <Card style="width: 100%; max-width: 32rem; overflow: hidden">
                <template #title>Modo local</template>
                <template #subtitle>Sin backend ni tabla de usuarios</template>
                <template #content>
                    <p class="m-0">
                        Esta version carga los puntos del juego directamente desde el archivo local
                        <code>reflejos.sqlite3</code>. Ya no necesitas levantar el backend, Docker ni la tabla de
                        usuarios y puntajes para jugar.
                    </p>
                </template>
            </Card>
        </div>
        <div class="w-full my-5">
            <!-- <h1 class="font-bold text-2xl">Modos</h1>
            <p>Disfruta de los siguientes modos para desafiar tu conocimiento.</p> -->
            <Accordion value="0">
                <AccordionPanel value="0">
                    <AccordionHeader>Modo normal</AccordionHeader>
                    <AccordionContent>
                        <p class="m-0">
                            Prepárate para una inmersión total en la belleza de la Provincia de Llanquihue con este
                            desafiante
                            modo de juego GeoGuessr. ¿Crees conocer sus lagos, volcanes y pintorescos pueblos? ¡Es hora
                            de poner
                            a prueba tus conocimientos geográficos y tu ojo para el detalle! <br>
                            Te lanzarás a un punto aleatorio en la vasta y diversa Provincia de Llanquihue.
                            Desde
                            las orillas del Lago Llanquihue hasta los rincones más remotos de la cordillera, cada ronda
                            es una
                            nueva incógnita. Tendrás libertad para mover la cámara, avanzar y retroceder, explorando
                            cada calle,
                            cada sendero y cada detalle que pueda darte una pista. <br>
                            ¡Afina tu vista, confía en tu intuición y sumérgete en el corazón de Llanquihue!
                        </p>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="1">
                    <AccordionHeader>Sin movimiento</AccordionHeader>
                    <AccordionContent>
                        <p class="m-0">
                            Prepárate para una experiencia que pondrá a prueba tu agudeza visual y tu
                            conocimiento de
                            la Provincia de Llanquihue como nunca antes. En este modo de juego, la clave no es la
                            exploración,
                            ¡sino la observación!<br>
                            Serás transportado a un punto aleatorio dentro de la fascinante Provincia de
                            Llanquihue.
                            Pero aquí está el giro: no podrás moverte. Tu ubicación será fija, una ventana única a un
                            rincón de
                            este hermoso territorio. <br>
                            ¡Agudiza tus sentidos y demuestra que puedes identificar cualquier lugar de Llanquihue con
                            solo una
                            mirada!
                        </p>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="2">
                    <AccordionHeader>Modo infinito</AccordionHeader>
                    <AccordionContent>
                        <p class="m-0">
                            Prepárate para una inmersión sin fin en la asombrosa geografía de la Provincia de Llanquihue
                            con
                            este emocionante modo de juego GeoGuessr. ¿Crees poder dominar cada rincón, cada lago y cada
                            volcán?
                            ¡Es hora de poner a prueba tu resistencia geográfica y tu habilidad para la exploración!
                            <br>
                            Te lanzarás a un punto aleatorio en la vasta y diversa Provincia de Llanquihue. A diferencia
                            de
                            otros modos, aquí la aventura nunca termina. Cada ronda es una nueva oportunidad para
                            descubrir un
                            paisaje diferente, un pueblo encantador o un camino escondido. <br>
                            ¡La Provincia de Llanquihue te espera con un sinfín de paisajes por explorar! ¿Hasta dónde
                            crees que
                            podrás llegar?
                        </p>
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </div>
    </div>

    <!-- Footer -->
    <div>
        <footer class="text-gray-300 p-4 mt-8">
            <img src="../assets/images/logo.png" alt="Logo of Reflejos del lago" class="h-12 w-auto">
            <div class="container mx-auto text-left">
                <p class="text-sm">© 2025 Reflejos del lago. Todos los derechos reservados.</p>
                <a href="https://github.com/sharedUSSRepo/Reflejos-del-lago" target="_blank">
                    <strong class="text-sm">Desarrollado por Alan y Vinbu</strong>
                </a>
            </div>
        </footer>
    </div>
</template>

<script setup>
import GameModes from '@/components/GameModes.vue';
import ProvinceOfLlanquihue from '@/components/ProvinceOfLlanquihue.vue';
import Card from 'primevue/card';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
// import ThreeSixtyView from '../components/ThreeSixtyView.vue'
import { defineAsyncComponent } from 'vue';
import { ref, onMounted, nextTick  } from 'vue';
// import ColumnGroup from 'primevue/columngroup';   // optional
// import Row from 'primevue/row';   

const ThreeSixtyView = defineAsyncComponent(() => import('../components/ThreeSixtyView.vue'));
const show360 = ref(false);

onMounted(async () => {
    await nextTick();

    setTimeout(() => {
        show360.value = true;
    }, 300);
});

</script>
