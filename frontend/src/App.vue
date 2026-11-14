<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMockMode, setMockMode, type MockMode } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const modes: { value: MockMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow (loading)' },
  { value: 'empty', label: 'Empty' },
  { value: 'error', label: 'Error' },
]
const currentMode = getMockMode()

async function logout() {
  auth.logout()
  await router.push({ name: 'login' })
}

// The mode is kept in sessionStorage, so a reload starts the app again in the chosen mode.
function switchMode(mode: MockMode) {
  setMockMode(mode)
  window.location.reload()
}
</script>

<template>
  <header class="topbar">
    <RouterLink to="/classes" class="brand">Gym Membership</RouterLink>
    <nav v-if="auth.user" class="nav" aria-label="Main">
      <RouterLink :to="{ name: 'classes' }">Classes</RouterLink>
      <RouterLink :to="{ name: 'plans' }">Plans</RouterLink>
      <RouterLink v-if="auth.isMember" :to="{ name: 'bookings' }">My bookings</RouterLink>
      <RouterLink v-if="auth.isStaff" :to="{ name: 'staff-payments' }">Payments</RouterLink>
    </nav>
    <div class="account">
      <template v-if="auth.user">
        <span>{{ auth.user.name }} <span class="badge">{{ auth.user.role }}</span></span>
        <button type="button" class="btn btn-ghost" @click="logout">Log out</button>
      </template>
      <template v-else>
        <RouterLink :to="{ name: 'login' }">Log in</RouterLink>
        <RouterLink :to="{ name: 'register' }" class="btn">Register</RouterLink>
      </template>
    </div>
  </header>

  <main class="page">
    <RouterView />
  </main>

  <footer class="mockbar">
    <span>Prototype mock data. Show a state:</span>
    <button
      v-for="mode in modes"
      :key="mode.value"
      type="button"
      class="chip"
      :class="{ 'chip-active': currentMode === mode.value }"
      @click="switchMode(mode.value)"
    >
      {{ mode.label }}
    </button>
  </footer>
</template>
