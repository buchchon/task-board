import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'
import { useTasks } from './composables/useTasks'

const app = createApp(App)

app.use(router)

// Establish the guest session before mounting so every component can assume
// a signed-in user is already present — no loading race between auth and data.
// Mount happens before the task fetch resolves, so the board's loading
// skeleton is actually visible rather than skipped straight to loaded data.
useAuth()
  .bootstrapGuestSession()
  .then(() => {
    app.mount('#app')
    return useTasks().fetchTasks()
  })
