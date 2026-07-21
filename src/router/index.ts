import { createRouter, createWebHistory } from 'vue-router'
import BoardPage from '@/views/BoardPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'board', component: BoardPage }],
})

export default router
