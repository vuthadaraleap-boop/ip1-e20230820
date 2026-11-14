// Date helpers. Membership dates are plain 'YYYY-MM-DD' strings (no time of day).

export function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayDate(): string {
  return dateOnly(new Date())
}

export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`)
  result.setUTCDate(result.getUTCDate() + days)
  return dateOnly(result)
}
