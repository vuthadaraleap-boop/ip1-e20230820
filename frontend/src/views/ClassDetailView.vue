<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AsyncState from '@/components/AsyncState.vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'
import { useClassesStore } from '@/stores/classes'
import { useMembershipsStore } from '@/stores/memberships'
import { errorMessage } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'
import { coversClass } from '@/utils/membership'

const route = useRoute()
const auth = useAuthStore()
const classes = useClassesStore()
const memberships = useMembershipsStore()
const bookings = useBookingsStore()

// The route parameter: /classes/:id  ->  route.params.id (always text, so convert it to a number).
const classId = computed(() => Number(route.params.id))

const preparing = ref(true)
const busy = ref(false)
const actionError = ref<string | null>(null)
const actionDone = ref<string | null>(null)

async function load() {
  preparing.value = true
  actionError.value = null
  actionDone.value = null
  // The button needs three answers: the class, my memberships and my bookings.
  await Promise.all([
    classes.fetchOne(classId.value),
    auth.isMember ? memberships.loadMine() : undefined,
    auth.isMember ? bookings.loadUpcoming() : undefined,
  ])
  preparing.value = false
}

// Runs once at start and again if the id in the URL changes.
watch(classId, load, { immediate: true })

const hasMembership = computed(() => {
  const c = classes.current
  return !!c && memberships.mine.some((m) => coversClass(m, c.startsAt))
})

const alreadyBooked = computed(() =>
  bookings.items.some((b) => b.classId === classId.value && b.status === 'BOOKED'),
)

// Why the Book button is disabled (null means the member can book). The page always says why.
const blockedReason = computed<string | null>(() => {
  const c = classes.current
  if (!c) return null
  if (!auth.isMember) return 'Only members can book classes.'
  if (c.status !== 'SCHEDULED') return 'This class was cancelled.'
  if (new Date(c.startsAt).getTime() <= Date.now()) return 'This class has already started.'
  if (alreadyBooked.value) return 'You have already booked this class.'
  if (!hasMembership.value) return 'You need an active membership that covers this class date.'
  if (c.seatsLeft <= 0) return 'Class is full.'
  return null
})

async function book() {
  actionError.value = null
  actionDone.value = null
  busy.value = true
  try {
    await bookings.book(classId.value)
    await classes.refreshCurrent()
    actionDone.value = 'Your seat is booked. You can see it in My bookings.'
  } catch (e) {
    // The server's rule message, for example "Class is full."
    actionError.value = errorMessage(e)
    await classes.refreshCurrent()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <p><RouterLink :to="{ name: 'classes' }">← Back to the timetable</RouterLink></p>

  <AsyncState
    :loading="preparing"
    :error="classes.currentError"
    :empty="!classes.current"
    empty-text="This class could not be found."
    @retry="load()"
  >
    <article v-if="classes.current" class="card">
      <p class="chips">
        <span class="badge">{{ classes.current.category }}</span>
        <span v-for="tag in classes.current.tags" :key="tag" class="badge badge-soft">{{ tag }}</span>
      </p>
      <h1>{{ classes.current.title }}</h1>
      <p>{{ classes.current.description }}</p>
      <dl class="facts">
        <div><dt>When</dt><dd>{{ formatDateTime(classes.current.startsAt) }}</dd></div>
        <div><dt>Length</dt><dd>{{ classes.current.durationMinutes }} minutes</dd></div>
        <div><dt>Coach</dt><dd>{{ classes.current.coachName }}</dd></div>
        <div>
          <dt>Seats left</dt>
          <dd>{{ Math.max(classes.current.seatsLeft, 0) }} of {{ classes.current.capacity }}</dd>
        </div>
      </dl>

      <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>
      <p v-if="actionDone" class="form-ok" role="status">{{ actionDone }}</p>

      <button type="button" class="btn btn-primary" :disabled="busy || blockedReason !== null" @click="book">
        {{ busy ? 'Booking…' : 'Book a seat' }}
      </button>
      <p v-if="blockedReason" class="hint">
        {{ blockedReason }}
        <RouterLink v-if="auth.isMember && !hasMembership" :to="{ name: 'plans' }">See the plans</RouterLink>
      </p>
    </article>
  </AsyncState>
</template>
