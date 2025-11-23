import './assets/main.css'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: window.matchMedia("(max-width: 768px)").matches
    ? "top-center"
    : "bottom-center",

  timeout: 4000,
});

app.mount('#app')
