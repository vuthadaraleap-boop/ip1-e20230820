import type { Membership } from '@/types'
import { todayDate } from './dates'

// A membership is "current" when it is ACTIVE and today is inside its date range.
export function isCurrent(membership: Membership): boolean {
  if (membership.status !== 'ACTIVE' || !membership.startDate || !membership.endDate) return false
  const today = todayDate()
  return membership.startDate <= today && today <= membership.endDate
}

// A membership covers a class when the class date is inside its date range.
// The mock API and the Book button on the screen both use this one rule.
export function coversClass(membership: Membership, classStartsAt: string): boolean {
  if (membership.status !== 'ACTIVE' || !membership.startDate || !membership.endDate) return false
  const classDate = classStartsAt.slice(0, 10)
  return membership.startDate <= classDate && classDate <= membership.endDate
}

// Used to stop a second request: a member may not have a PENDING or a still valid ACTIVE membership.
export function isOpen(membership: Membership): boolean {
  if (membership.status === 'PENDING') return true
  return membership.status === 'ACTIVE' && !!membership.endDate && membership.endDate >= todayDate()
}
