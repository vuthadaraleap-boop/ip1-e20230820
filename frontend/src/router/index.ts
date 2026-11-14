import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Extra information we attach to routes, used by the guard below.
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    staffOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'classes' } },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guestOnly: true } },
    { path: '/plans', name: 'plans', component: () => import('@/views/PlansView.vue'), meta: { requiresAuth: true } },
    { path: '/classes', name: 'classes', component: () => import('@/views/ClassesView.vue'), meta: { requiresAuth: true } },
    // The detail page: ":id" is the route parameter, read in the view with useRoute().params.id
    { path: '/classes/:id', name: 'class-detail', component: () => import('@/views/ClassDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/bookings', name: 'bookings', component: () => import('@/views/MyBookingsView.vue'), meta: { requiresAuth: true } },
    { path: '/staff/payments', name: 'staff-payments', component: () => import('@/views/StaffPaymentsView.vue'), meta: { requiresAuth: true, staffOnly: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})

// Route guard (prototype version): the real checks are on the API, this only keeps the UI tidy.
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.user) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guestOnly && auth.user) return { name: 'classes' }
  if (to.meta.staffOnly && !auth.isStaff) return { name: 'classes' }
  return true
})

export default router
