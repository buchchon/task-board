import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'

const app = createApp(App)

app.use(router)

// Establish the guest session before mounting so every component can assume
// a signed-in user is already present — no loading race between auth and data.
useAuth()
  .bootstrapGuestSession()
  .then(() => app.mount('#app'))
