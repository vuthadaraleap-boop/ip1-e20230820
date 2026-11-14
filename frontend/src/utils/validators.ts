// Client-side form validation. Every function returns an object with one message per bad field.
// An empty object means the form is valid.
// The server will validate again in M2 (DTOs), because the client cannot be trusted.

export type FieldErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function checkEmail(email: string, errors: FieldErrors): void {
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.'
}

function checkPassword(password: string, errors: FieldErrors): void {
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
}

export function validateLogin(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  checkEmail(values.email, errors)
  checkPassword(values.password, errors)
  return errors
}

export function validateRegister(values: { name: string; email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.'
  checkEmail(values.email, errors)
  checkPassword(values.password, errors)
  return errors
}

export function validatePaymentMethod(method: string): string | null {
  return method ? null : 'Choose a payment method.'
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
