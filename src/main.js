import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const isMobile = window.matchMedia('(max-width: 768px)').matches

app.use(Toast, {
  position: isMobile ? POSITION.TOP_CENTER : POSITION.TOP_RIGHT,
  timeout: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
})

app.mount('#app')