<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AsyncState from '@/components/AsyncState.vue'
import { useBookingsStore } from '@/stores/bookings'
import type { BookingWhen } from '@/types'
import { errorMessage } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'

const bookings = useBookingsStore()

const actionError = ref<string | null>(null)
const cancellingId = ref<number | null>(null)

const tabs: { value: BookingWhen; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

const emptyText = computed(() =>
  bookings.when === 'upcoming'
    ? 'You have no upcoming bookings. Pick a class in the timetable.'
    : 'You have no past bookings yet.',
)

onMounted(() => bookings.load())

function show(when: BookingWhen) {
  actionError.value = null
  bookings.when = when
  bookings.load()
}

async function cancel(bookingId: number) {
  actionError.value = null
  cancellingId.value = bookingId
  try {
    await bookings.cancel(bookingId)
  } catch (e) {
    // For example "Too late to cancel." when the class starts in less than 2 hours.
    actionError.value = errorMessage(e)
  } finally {
    cancellingId.value = null
  }
}
</script>

<template>
  <h1>My bookings</h1>

  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      class="chip"
      :class="{ 'chip-active': bookings.when === tab.value }"
      :aria-selected="bookings.when === tab.value"
      @click="show(tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>

  <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>

  <AsyncState
    :loading="bookings.loading"
    :error="bookings.error"
    :empty="bookings.items.length === 0"
    :empty-text="emptyText"
    @retry="bookings.load()"
  >
    <ul class="list">
      <li v-for="booking in bookings.items" :key="booking.id" class="list-row">
        <div>
          <RouterLink :to="{ name: 'class-detail', params: { id: booking.classId } }">
            <strong>{{ booking.gymClass.title }}</strong>
          </RouterLink>
          <p class="muted">{{ formatDateTime(booking.gymClass.startsAt) }} · {{ booking.gymClass.coachName }}</p>
        </div>
        <div class="row-actions">
          <span class="badge" :class="booking.status === 'CANCELLED' ? 'badge-warn' : 'badge-ok'">
            {{ booking.status === 'BOOKED' ? 'Booked' : 'Cancelled' }}
          </span>
          <button
            v-if="bookings.when === 'upcoming' && booking.status === 'BOOKED'"
            type="button"
            class="btn"
            :disabled="cancellingId === booking.id"
            @click="cancel(booking.id)"
          >
            {{ cancellingId === booking.id ? 'Cancelling…' : 'Cancel' }}
          </button>
        </div>
      </li>
    </ul>
    <p v-if="bookings.when === 'upcoming'" class="hint">You can cancel until 2 hours before the class.</p>
  </AsyncState>
</template>
