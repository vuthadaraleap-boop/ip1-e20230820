<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AsyncState from '@/components/AsyncState.vue'
import { useAuthStore } from '@/stores/auth'
import { useMembershipsStore } from '@/stores/memberships'
import { errorMessage } from '@/utils/errors'
import { formatDate, formatPrice } from '@/utils/format'

const auth = useAuthStore()
const memberships = useMembershipsStore()

// Message about the last button click only matters to this page, so it stays here.
const actionError = ref<string | null>(null)
const actionDone = ref<string | null>(null)
const busy = ref(false)

onMounted(() => memberships.loadPlansPage())

async function run(action: () => Promise<void>, doneText: string) {
  actionError.value = null
  actionDone.value = null
  busy.value = true
  try {
    await action()
    actionDone.value = doneText
  } catch (e) {
    actionError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

const requestPlan = (planId: number) =>
  run(() => memberships.requestPlan(planId), 'Plan requested. Pay at the front desk and staff will activate it.')

const cancelPending = (membershipId: number) =>
  run(() => memberships.cancelPending(membershipId), 'Request cancelled.')
</script>

<template>
  <h1>Membership plans</h1>

  <AsyncState
    :loading="memberships.loading"
    :error="memberships.error"
    :empty="memberships.plans.length === 0"
    empty-text="There are no plans to choose from right now."
    @retry="memberships.loadPlansPage()"
  >
    <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>
    <p v-if="actionDone" class="form-ok" role="status">{{ actionDone }}</p>

    <div v-if="memberships.currentMembership" class="banner banner-ok">
      Your <strong>{{ memberships.currentMembership.planName }}</strong> membership is active until
      {{ formatDate(memberships.currentMembership.endDate ?? '') }}.
    </div>
    <div v-else-if="memberships.pendingMembership" class="banner banner-wait">
      <span>
        Your <strong>{{ memberships.pendingMembership.planName }}</strong> request is waiting for payment at the front desk.
      </span>
      <button type="button" class="btn" :disabled="busy" @click="cancelPending(memberships.pendingMembership.id)">
        Cancel request
      </button>
    </div>

    <div class="grid">
      <article v-for="plan in memberships.plans" :key="plan.id" class="card">
        <h2>{{ plan.name }}</h2>
        <p class="price">{{ formatPrice(plan.priceCents) }}</p>
        <p class="muted">{{ plan.durationDays }} days</p>
        <p>{{ plan.description }}</p>
        <button
          v-if="auth.isMember"
          type="button"
          class="btn btn-primary"
          :disabled="busy || memberships.hasOpenMembership"
          @click="requestPlan(plan.id)"
        >
          Request this plan
        </button>
      </article>
    </div>
    <p v-if="auth.isMember && memberships.hasOpenMembership" class="hint">
      You can request a new plan when your current one has ended.
    </p>
    <p v-if="!auth.isMember" class="hint">Only members can request a plan.</p>
  </AsyncState>
</template>
