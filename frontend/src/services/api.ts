// Helpers shared by all mock services. In M3 the services will call the real API
// (fetch) and this file will mostly disappear. The stores and views will not change.

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Mock mode lets you see every screen state without breaking anything:
//   normal = fast answers, slow = 2.5 s delay (loading state),
//   empty  = every list is empty (empty state), error = every call fails (error state).
export type MockMode = 'normal' | 'slow' | 'empty' | 'error'

const MODE_KEY = 'gym.mockMode'

export function getMockMode(): MockMode {
  try {
    const saved = sessionStorage.getItem(MODE_KEY)
    if (saved === 'slow' || saved === 'empty' || saved === 'error') return saved
  } catch {
    // sessionStorage can be blocked by the browser; fall back to normal.
  }
  return 'normal'
}

export function setMockMode(mode: MockMode): void {
  try {
    sessionStorage.setItem(MODE_KEY, mode)
  } catch {
    // ignore, see above
  }
}

export function isEmptyMode(): boolean {
  return getMockMode() === 'empty'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Pretend to be a server: wait a bit, maybe fail, then return a COPY of the data
// (so a component can never change the mock database by accident).
export async function respond<T>(produce: () => T): Promise<T> {
  const mode = getMockMode()
  await sleep(mode === 'slow' ? 2500 : 400)
  if (mode === 'error') throw new ApiError(500, 'The server did not answer. Please try again.')
  return structuredClone(produce())
}
