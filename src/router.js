import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './screens/LandingPage.vue'
import GameView from './screens/PlayGame.vue'
import ResultView from './screens/ResultsScreen.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/PlayGame', component: GameView },
  { path: '/ResultsScreen', component: ResultView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router