<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import AsyncState from '@/components/AsyncState.vue'
import { useMembershipsStore } from '@/stores/memberships'
import type { MembershipFilter, PaymentMethod } from '@/types'
import { errorMessage } from '@/utils/errors'
import { formatDate, formatPaymentMethod, formatPrice } from '@/utils/format'
import { validatePaymentMethod } from '@/utils/validators'

const memberships = useMembershipsStore()

const filters: { value: MembershipFilter; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ALL', label: 'All' },
]
const methods: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
]

// One chosen payment method (and one error message) per row, keyed by the membership id.
const chosen = reactive<Record<number, PaymentMethod | ''>>({})
const rowErrors = reactive<Record<number, string>>({})
const confirmingId = ref<number | null>(null)
const actionError = ref<string | null>(null)

onMounted(() => memberships.loadStaffList())

// Every row starts with "no method chosen", so the dropdown shows its "Method…" placeholder.
watch(
  () => memberships.staffList,
  (list) => {
    for (const item of list) {
      if (!(item.id in chosen)) chosen[item.id] = ''
    }
  },
  { immediate: true },
)

async function confirm(membershipId: number) {
  actionError.value = null
  const method = chosen[membershipId]
  const message = validatePaymentMethod(method ?? '')
  if (message || !method) {
    rowErrors[membershipId] = message ?? 'Choose a payment method.'
    return // client-side validation: no request is sent
  }
  delete rowErrors[membershipId]
  confirmingId.value = membershipId
  try {
    await memberships.confirmPayment(membershipId, method)
  } catch (e) {
    actionError.value = errorMessage(e)
  } finally {
    confirmingId.value = null
  }
}
</script>

<template>
  <h1>Payments to confirm</h1>
  <p class="muted">A member pays at the front desk, then staff confirm the payment here.</p>

  <div class="tabs" role="tablist">
    <button
      v-for="filter in filters"
      :key="filter.value"
      type="button"
      role="tab"
      class="chip"
      :class="{ 'chip-active': memberships.staffFilter === filter.value }"
      :aria-selected="memberships.staffFilter === filter.value"
      @click="memberships.staffFilter = filter.value; memberships.loadStaffList()"
    >
      {{ filter.label }}
    </button>
  </div>

  <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>

  <AsyncState
    :loading="memberships.loading"
    :error="memberships.error"
    :empty="memberships.staffList.length === 0"
    empty-text="Nothing here. No memberships have this status."
    @retry="memberships.loadStaffList()"
  >
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Plan</th>
            <th>Price</th>
            <th>Status</th>
            <th>Dates</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in memberships.staffList" :key="item.id">
            <td>{{ item.memberName }}</td>
            <td>{{ item.planName }} ({{ item.durationDays }} days)</td>
            <td>{{ formatPrice(item.priceCents) }}</td>
            <td>
              <span
                class="badge"
                :class="{ 'badge-ok': item.status === 'ACTIVE', 'badge-warn': item.status === 'CANCELLED' }"
              >
                {{ item.status }}
              </span>
            </td>
            <td>
              <template v-if="item.startDate && item.endDate">
                {{ formatDate(item.startDate) }} to {{ formatDate(item.endDate) }}
              </template>
              <template v-else>-</template>
            </td>
            <td>
              <form v-if="item.status === 'PENDING'" class="inline-form" novalidate @submit.prevent="confirm(item.id)">
                <select v-model="chosen[item.id]" :aria-label="`Payment method for ${item.memberName}`">
                  <option value="">Method…</option>
                  <option v-for="method in methods" :key="method.value" :value="method.value">{{ method.label }}</option>
                </select>
                <button type="submit" class="btn btn-primary" :disabled="confirmingId === item.id">
                  {{ confirmingId === item.id ? 'Saving…' : 'Confirm' }}
                </button>
                <p v-if="rowErrors[item.id]" class="field-error">{{ rowErrors[item.id] }}</p>
              </form>
              <template v-else-if="item.paymentMethod">{{ formatPaymentMethod(item.paymentMethod) }}</template>
              <template v-else>-</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AsyncState>
</template>
