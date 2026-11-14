import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as classService from '@/services/classService'
import type { GymClass } from '@/types'
import { errorMessage } from '@/utils/errors'

export const useClassesStore = defineStore('classes', () => {
  // The timetable
  const items = ref<GymClass[]>([])
  const categories = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // The filters live here (not in the view) so they are still set when you come back from a class page.
  const search = ref('')
  const category = ref('')

  // One class for the detail page
  const current = ref<GymClass | null>(null)
  const currentLoading = ref(false)
  const currentError = ref<string | null>(null)

  // If the user changes a filter while a request is still running, only the newest answer is used.
  let latestRequest = 0

  async function fetchAll(): Promise<void> {
    const request = ++latestRequest
    loading.value = true
    error.value = null
    try {
      const list = await classService.listClasses({ search: search.value, category: category.value })
      if (categories.value.length === 0) categories.value = await classService.listCategories()
      if (request !== latestRequest) return
      items.value = list
    } catch (e) {
      if (request !== latestRequest) return
      items.value = []
      error.value = errorMessage(e)
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  async function fetchOne(id: number): Promise<void> {
    currentLoading.value = true
    currentError.value = null
    current.value = null
    try {
      current.value = await classService.getClass(id)
    } catch (e) {
      currentError.value = errorMessage(e)
    } finally {
      currentLoading.value = false
    }
  }

  // Refresh the seat count after a booking, without showing the loading state again.
  async function refreshCurrent(): Promise<void> {
    if (!current.value) return
    try {
      current.value = await classService.getClass(current.value.id)
    } catch {
      // keep the old data; the next full load will show the error
    }
  }

  function clearFilters(): void {
    search.value = ''
    category.value = ''
  }

  return {
    items, categories, loading, error, search, category,
    current, currentLoading, currentError,
    fetchAll, fetchOne, refreshCurrent, clearFilters,
  }
})
