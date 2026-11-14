// The in-memory "database" for the prototype. It is built from db.json when the page loads,
// so every reload starts again from the same seed data.
// Times in db.json are offsets ("startsInHours"), so the classes are always upcoming.

import raw from './db.json'
import type {
  Booking,
  BookingStatus,
  ClassStatus,
  GymClass,
  Membership,
  MembershipStatus,
  PaymentMethod,
  Plan,
  Role,
  User,
} from '@/types'
import { addDays, dateOnly } from '@/utils/dates'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// A class as stored. "booked" and "seatsLeft" are not stored, they are counted from the bookings.
export type StoredClass = Omit<GymClass, 'booked' | 'seatsLeft'>
export type StoredBooking = Omit<Booking, 'gymClass'>

const users: User[] = raw.users.map((u) => ({ ...u, role: u.role as Role }))

const plans: Plan[] = raw.plans

const classes: StoredClass[] = raw.classes.map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  category: c.category,
  tags: c.tags,
  startsAt: new Date(Date.now() + c.startsInHours * HOUR).toISOString(),
  durationMinutes: c.durationMinutes,
  capacity: c.capacity,
  coachName: c.coachName,
  status: c.status as ClassStatus,
}))

const memberships: Membership[] = raw.memberships.map((m) => {
  const user = users.find((u) => u.id === m.userId)
  const plan = plans.find((p) => p.id === m.planId)
  if (!user || !plan) throw new Error(`Bad seed data for membership ${m.id}`)
  const startDate = m.startedDaysAgo === null ? null : dateOnly(new Date(Date.now() - m.startedDaysAgo * DAY))
  return {
    id: m.id,
    userId: user.id,
    memberName: user.name,
    planId: plan.id,
    planName: plan.name,
    status: m.status as MembershipStatus,
    priceCents: plan.priceCents,
    durationDays: plan.durationDays,
    startDate,
    endDate: startDate === null ? null : addDays(startDate, plan.durationDays - 1),
    paidAt: startDate === null ? null : `${startDate}T09:00:00.000Z`,
    paymentMethod: m.paymentMethod as PaymentMethod | null,
  }
})

const bookings: StoredBooking[] = raw.bookings.map((b) => ({
  id: b.id,
  userId: b.userId,
  classId: b.classId,
  status: b.status as BookingStatus,
  createdAt: new Date(Date.now() - b.createdHoursAgo * HOUR).toISOString(),
  cancelledAt: b.status === 'CANCELLED' ? new Date(Date.now() - 2 * HOUR).toISOString() : null,
}))

export const db = {
  categories: raw.categories,
  users,
  plans,
  classes,
  memberships,
  bookings,
}

// Next free id for a list (the real database does this for us with auto-increment).
export function nextId(list: { id: number }[]): number {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

// Count the BOOKED bookings of a class to know how many seats are taken.
export function withSeats(stored: StoredClass): GymClass {
  const booked = db.bookings.filter((b) => b.classId === stored.id && b.status === 'BOOKED').length
  return { ...stored, booked, seatsLeft: stored.capacity - booked }
}

export function toBooking(stored: StoredBooking): Booking {
  const storedClass = db.classes.find((c) => c.id === stored.classId)
  if (!storedClass) throw new Error(`Booking ${stored.id} points to a class that does not exist`)
  return { ...stored, gymClass: withSeats(storedClass) }
}
