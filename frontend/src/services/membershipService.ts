import { db, nextId } from '@/mock/mockDb'
import type { Membership, MembershipFilter, PaymentMethod, Plan } from '@/types'
import { addDays, todayDate } from '@/utils/dates'
import { isOpen } from '@/utils/membership'
import { ApiError, isEmptyMode, respond } from './api'

// Members only see active plans.
export function listPlans(): Promise<Plan[]> {
  return respond(() => (isEmptyMode() ? [] : db.plans.filter((p) => p.active)))
}

export function listMyMemberships(userId: number): Promise<Membership[]> {
  return respond(() => db.memberships.filter((m) => m.userId === userId))
}

// Rule from story 2: a PENDING membership with no dates, copying the plan's price and duration.
export function requestPlan(userId: number, planId: number): Promise<Membership> {
  return respond(() => {
    const plan = db.plans.find((p) => p.id === planId && p.active)
    const user = db.users.find((u) => u.id === userId)
    if (!plan || !user) throw new ApiError(404, 'This plan does not exist.')
    if (db.memberships.some((m) => m.userId === userId && isOpen(m))) {
      throw new ApiError(400, 'You already have a pending or active membership.')
    }
    const membership: Membership = {
      id: nextId(db.memberships),
      userId,
      memberName: user.name,
      planId: plan.id,
      planName: plan.name,
      status: 'PENDING',
      priceCents: plan.priceCents,
      durationDays: plan.durationDays,
      startDate: null,
      endDate: null,
      paidAt: null,
      paymentMethod: null,
    }
    db.memberships.push(membership)
    return membership
  })
}

// A member can cancel only their own PENDING membership.
export function cancelPending(userId: number, membershipId: number): Promise<Membership> {
  return respond(() => {
    const membership = db.memberships.find((m) => m.id === membershipId && m.userId === userId)
    if (!membership) throw new ApiError(404, 'Membership not found.')
    if (membership.status !== 'PENDING') throw new ApiError(400, 'Only a pending membership can be cancelled.')
    membership.status = 'CANCELLED'
    return membership
  })
}

// Staff: list memberships by status (PENDING is the default on the screen).
export function listMemberships(filter: MembershipFilter): Promise<Membership[]> {
  return respond(() => {
    if (isEmptyMode()) return []
    return db.memberships.filter((m) => filter === 'ALL' || m.status === filter)
  })
}

// Staff confirm a payment: ACTIVE, starts today, ends start + duration - 1 day.
export function confirmPayment(membershipId: number, method: PaymentMethod): Promise<Membership> {
  return respond(() => {
    const membership = db.memberships.find((m) => m.id === membershipId)
    if (!membership) throw new ApiError(404, 'Membership not found.')
    if (membership.status !== 'PENDING') throw new ApiError(400, 'Only a pending membership can be confirmed.')
    const start = todayDate()
    membership.status = 'ACTIVE'
    membership.startDate = start
    membership.endDate = addDays(start, membership.durationDays - 1)
    membership.paidAt = new Date().toISOString()
    membership.paymentMethod = method
    return membership
  })
}
