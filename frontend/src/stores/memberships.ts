import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as membershipService from '@/services/membershipService'
import type { Membership, MembershipFilter, PaymentMethod, Plan } from '@/types'
import { errorMessage } from '@/utils/errors'
import { isCurrent, isOpen } from '@/utils/membership'
import { useAuthStore } from './auth'

export const useMembershipsStore = defineStore('memberships', () => {
  const plans = ref<Plan[]>([])
  const mine = ref<Membership[]>([]) // my own memberships (member screens)
  const staffList = ref<Membership[]>([]) // everybody's memberships (staff screen)
  const staffFilter = ref<MembershipFilter>('PENDING')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Derived from "mine": the screens ask these questions, nobody copies the answers.
  const currentMembership = computed(() => mine.value.find(isCurrent) ?? null)
  const pendingMembership = computed(() => mine.value.find((m) => m.status === 'PENDING') ?? null)
  const hasOpenMembership = computed(() => mine.value.some(isOpen))

  async function loadPlansPage(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const userId = useAuthStore().requireUserId()
      const [planList, myList] = await Promise.all([
        membershipService.listPlans(),
        membershipService.listMyMemberships(userId),
      ])
      plans.value = planList
      mine.value = myList
    } catch (e) {
      error.value = errorMessage(e)
    } finally {
      loading.value = false
    }
  }

  // Used by the class page, which only needs to know if I may book.
  async function loadMine(): Promise<void> {
    try {
      mine.value = await membershipService.listMyMemberships(useAuthStore().requireUserId())
    } catch {
      mine.value = []
    }
  }

  async function requestPlan(planId: number): Promise<void> {
    await membershipService.requestPlan(useAuthStore().requireUserId(), planId)
    await loadMine()
  }

  async function cancelPending(membershipId: number): Promise<void> {
    await membershipService.cancelPending(useAuthStore().requireUserId(), membershipId)
    await loadMine()
  }

  async function loadStaffList(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      staffList.value = await membershipService.listMemberships(staffFilter.value)
    } catch (e) {
      staffList.value = []
      error.value = errorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function confirmPayment(membershipId: number, method: PaymentMethod): Promise<void> {
    await membershipService.confirmPayment(membershipId, method)
    staffList.value = await membershipService.listMemberships(staffFilter.value)
  }

  return {
    plans, mine, staffList, staffFilter, loading, error,
    currentMembership, pendingMembership, hasOpenMembership,
    loadPlansPage, loadMine, requestPlan, cancelPending, loadStaffList, confirmPayment,
  }
})
