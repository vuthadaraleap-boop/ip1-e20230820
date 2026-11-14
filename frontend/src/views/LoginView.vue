<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/utils/errors'
import { hasErrors, validateLogin, type FieldErrors } from '@/utils/validators'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Form state stays in the component: nobody else needs a half-typed form.
const form = reactive({ email: '', password: '' })
const errors = ref<FieldErrors>({})
const submitting = ref(false)
const serverError = ref<string | null>(null)

async function submit() {
  serverError.value = null
  errors.value = validateLogin(form)
  if (hasErrors(errors.value)) return // client-side validation stops here, no request is sent

  submitting.value = true
  try {
    await auth.login(form.email, form.password)
    // Go back to the page the guard interrupted, but only to a path inside this app.
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    await router.push(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/classes')
  } catch (e) {
    serverError.value = errorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="card narrow">
    <h1>Log in</h1>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" :aria-invalid="!!errors.password" />
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>
      <p v-if="serverError" class="form-error" role="alert">{{ serverError }}</p>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
    <p class="hint">
      No account? <RouterLink :to="{ name: 'register' }">Register</RouterLink>
    </p>
    <details class="hint">
      <summary>Test accounts (any password of 8+ characters)</summary>
      <ul>
        <li>member@gym.test: active membership</li>
        <li>new@gym.test: no membership yet</li>
        <li>staff@gym.test: staff</li>
        <li>admin@gym.test: admin</li>
      </ul>
    </details>
  </section>
</template>
