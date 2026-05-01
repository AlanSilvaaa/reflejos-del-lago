import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import 'primeicons/primeicons.css'
import './styles/input.css'

const ReflejosTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{sky.50}',
            100: '{sky.100}',
            200: '{sky.200}',
            300: '{sky.300}',
            400: '{sky.400}',
            500: '{sky.500}',
            600: '{sky.600}',
            700: '{sky.700}',
            800: '{sky.800}',
            900: '{sky.900}',
            950: '{sky.950}'
        }
    }
})

const app = createApp(App)
app.use(router)
app.use(ToastService)
app.use(PrimeVue, {
    theme: {
        preset: ReflejosTheme,
        options: {
            prefix: 'p',
            darkModeSelector: '.my-app-dark', // force dark mode
            cssLayer: false
        }
    }
});
app.mount('#app')
