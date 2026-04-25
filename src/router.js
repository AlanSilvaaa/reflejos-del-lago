import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './screens/LandingPage.vue'
import GameView from './screens/Game.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/Game', component: GameView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
