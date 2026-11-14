import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'
import type { User } from '@/types'

const STORAGE_KEY = 'gym.user'

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'number' && typeof v.name === 'string' && typeof v.email === 'string' && typeof v.role === 'string'
}

// Keep the logged-in user after a page reload (prototype only, see MILESTONES.md for the real token plan).
function loadSavedUser(): User | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (!text) return null
    const data: unknown = JSON.parse(text)
    return isUser(data) ? data : null
  } catch {
    return null
  }
}

function saveUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked: the user just has to log in again after a reload
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(loadSavedUser())

  const isStaff = computed(() => user.value?.role === 'STAFF' || user.value?.role === 'ADMIN')
  const isMember = computed(() => user.value?.role === 'MEMBER')

  async function login(email: string, password: string): Promise<void> {
    user.value = await authService.login(email, password)
    saveUser(user.value)
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    user.value = await authService.register({ name, email, password })
    saveUser(user.value)
  }

  function logout(): void {
    user.value = null
    saveUser(null)
  }

  // Other stores call this when they need "my id" for a request.
  function requireUserId(): number {
    if (!user.value) throw new Error('Please log in first.')
    return user.value.id
  }

  return { user, isStaff, isMember, login, register, logout, requireUserId }
})
