import { db, nextId, toBooking, withSeats } from '@/mock/mockDb'
import type { Booking, BookingWhen } from '@/types'
import { coversClass } from '@/utils/membership'
import { ApiError, isEmptyMode, respond } from './api'

const CANCEL_LIMIT_MS = 2 * 60 * 60 * 1000 // cancelling is allowed until 2 hours before the class

// Only the bookings of this member (story 4), split into upcoming and past.
export function listMyBookings(userId: number, when: BookingWhen): Promise<Booking[]> {
  return respond(() => {
    if (isEmptyMode()) return []
    const now = Date.now()
    const mine = db.bookings.filter((b) => b.userId === userId).map(toBooking)
    if (when === 'upcoming') {
      return mine
        .filter((b) => new Date(b.gymClass.startsAt).getTime() > now)
        .sort((a, b) => a.gymClass.startsAt.localeCompare(b.gymClass.startsAt))
    }
    return mine
      .filter((b) => new Date(b.gymClass.startsAt).getTime() <= now)
      .sort((a, b) => b.gymClass.startsAt.localeCompare(a.gymClass.startsAt))
  })
}

// Story 3 rules. A broken rule is a 400 with the reason, like the real API will answer.
export function bookClass(userId: number, classId: number): Promise<Booking> {
  return respond(() => {
    const gymClass = db.classes.find((c) => c.id === classId)
    if (!gymClass) throw new ApiError(404, 'This class does not exist.')
    if (gymClass.status !== 'SCHEDULED' || new Date(gymClass.startsAt).getTime() <= Date.now()) {
      throw new ApiError(400, 'This class is not open for booking.')
    }
    const covered = db.memberships.some((m) => m.userId === userId && coversClass(m, gymClass.startsAt))
    if (!covered) throw new ApiError(400, 'You need an active membership that covers this class.')
    const existing = db.bookings.find((b) => b.userId === userId && b.classId === classId)
    if (existing?.status === 'BOOKED') throw new ApiError(400, 'You already booked this class.')
    if (withSeats(gymClass).seatsLeft <= 0) throw new ApiError(400, 'Class is full.')

    if (existing) {
      // One booking per class and member: booking again after a cancel re-opens the same row.
      existing.status = 'BOOKED'
      existing.cancelledAt = null
      existing.createdAt = new Date().toISOString()
      return toBooking(existing)
    }
    const booking = {
      id: nextId(db.bookings),
      userId,
      classId,
      status: 'BOOKED' as const,
      createdAt: new Date().toISOString(),
      cancelledAt: null,
    }
    db.bookings.push(booking)
    return toBooking(booking)
  })
}

export function cancelBooking(userId: number, bookingId: number): Promise<Booking> {
  return respond(() => {
    // Someone else's booking looks like a missing one: 404, not 403.
    const booking = db.bookings.find((b) => b.id === bookingId && b.userId === userId)
    if (!booking) throw new ApiError(404, 'Booking not found.')
    if (booking.status === 'CANCELLED') throw new ApiError(400, 'This booking is already cancelled.')
    const gymClass = db.classes.find((c) => c.id === booking.classId)
    if (!gymClass) throw new ApiError(404, 'Booking not found.')
    if (new Date(gymClass.startsAt).getTime() - Date.now() < CANCEL_LIMIT_MS) {
      throw new ApiError(400, 'Too late to cancel.')
    }
    booking.status = 'CANCELLED'
    booking.cancelledAt = new Date().toISOString()
    return toBooking(booking)
  })
}
