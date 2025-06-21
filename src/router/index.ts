// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import JuegosView from '@/views/JuegosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'juegos',
      component: JuegosView
    }
  ]
})

export default router
