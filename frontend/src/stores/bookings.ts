import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as bookingService from '@/services/bookingService'
import type { Booking, BookingWhen } from '@/types'
import { errorMessage } from '@/utils/errors'
import { useAuthStore } from './auth'

export const useBookingsStore = defineStore('bookings', () => {
  const items = ref<Booking[]>([])
  const when = ref<BookingWhen>('upcoming') // the upcoming / past tab
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await bookingService.listMyBookings(useAuthStore().requireUserId(), when.value)
    } catch (e) {
      items.value = []
      error.value = errorMessage(e)
    } finally {
      loading.value = false
    }
  }

  // The class page uses this to know if I already booked the class it shows.
  async function loadUpcoming(): Promise<void> {
    when.value = 'upcoming'
    await load()
  }

  // Book and cancel throw the server's message (for example "Class is full."),
  // the view catches it and shows it next to the button.
  async function book(classId: number): Promise<void> {
    await bookingService.bookClass(useAuthStore().requireUserId(), classId)
    await loadUpcoming()
  }

  async function cancel(bookingId: number): Promise<void> {
    await bookingService.cancelBooking(useAuthStore().requireUserId(), bookingId)
    await load()
  }

  return { items, when, loading, error, load, loadUpcoming, book, cancel }
})
