import { db, withSeats } from '@/mock/mockDb'
import type { ClassFilters, GymClass } from '@/types'
import { ApiError, isEmptyMode, respond } from './api'

// Timetable: scheduled classes that have not started yet, soonest first.
export function listClasses(filters: ClassFilters): Promise<GymClass[]> {
  return respond(() => {
    if (isEmptyMode()) return []
    const text = filters.search.trim().toLowerCase()
    const now = Date.now()
    return db.classes
      .filter((c) => c.status === 'SCHEDULED' && new Date(c.startsAt).getTime() > now)
      .filter((c) => !filters.category || c.category === filters.category)
      .filter((c) => !text || c.title.toLowerCase().includes(text))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(withSeats)
  })
}

export function getClass(id: number): Promise<GymClass> {
  return respond(() => {
    const found = db.classes.find((c) => c.id === id)
    if (!found) throw new ApiError(404, 'This class does not exist.')
    return withSeats(found)
  })
}

export function listCategories(): Promise<string[]> {
  return respond(() => db.categories)
}
