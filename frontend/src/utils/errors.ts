// One place that turns anything thrown into a message we can show to the user.
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
