<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/utils/errors'
import { hasErrors, validateRegister, type FieldErrors } from '@/utils/validators'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '' })
const errors = ref<FieldErrors>({})
const submitting = ref(false)
const serverError = ref<string | null>(null)

async function submit() {
  serverError.value = null
  errors.value = validateRegister(form)
  if (hasErrors(errors.value)) return

  submitting.value = true
  try {
    // There is no role field on purpose: registering always creates a MEMBER.
    await auth.register(form.name, form.email, form.password)
    await router.push({ name: 'plans' })
  } catch (e) {
    serverError.value = errorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="card narrow">
    <h1>Create your account</h1>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" autocomplete="name" :aria-invalid="!!errors.name" />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="new-password" :aria-invalid="!!errors.password" />
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        <p v-else class="hint">At least 8 characters.</p>
      </div>
      <p v-if="serverError" class="form-error" role="alert">{{ serverError }}</p>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Creating account…' : 'Register' }}
      </button>
    </form>
    <p class="hint">
      Already registered? <RouterLink :to="{ name: 'login' }">Log in</RouterLink>
    </p>
  </section>
</template>
