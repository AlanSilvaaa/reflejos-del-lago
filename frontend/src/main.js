import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import './styles/input.css'

const app = createApp(App)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.my-app-dark', // force dark mode
            cssLayer: false
        }
    }
});
app.mount('#app')
