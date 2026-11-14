// Shapes of the data used by the whole frontend.
// They follow the entities in PROPOSAL.md, so the real API can return the same shapes later.

export type Role = 'MEMBER' | 'STAFF' | 'ADMIN'
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER'
export type BookingStatus = 'BOOKED' | 'CANCELLED'
export type ClassStatus = 'SCHEDULED' | 'CANCELLED'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Plan {
  id: number
  name: string
  description: string
  priceCents: number
  durationDays: number
  active: boolean
}

export interface Membership {
  id: number
  userId: number
  memberName: string
  planId: number
  planName: string
  status: MembershipStatus
  // Copied from the plan when the member requests it, so later plan changes do not affect it.
  priceCents: number
  durationDays: number
  // Dates are 'YYYY-MM-DD' strings. They stay null until staff confirm the payment.
  startDate: string | null
  endDate: string | null
  paidAt: string | null
  paymentMethod: PaymentMethod | null
}

export interface GymClass {
  id: number
  title: string
  description: string
  category: string
  tags: string[]
  startsAt: string // ISO date-time
  durationMinutes: number
  capacity: number
  booked: number
  seatsLeft: number
  coachName: string
  status: ClassStatus
}

export interface Booking {
  id: number
  userId: number
  classId: number
  status: BookingStatus
  createdAt: string
  cancelledAt: string | null
  gymClass: GymClass
}

export interface ClassFilters {
  search: string
  category: string
}

export type BookingWhen = 'upcoming' | 'past'
export type MembershipFilter = MembershipStatus | 'ALL'
