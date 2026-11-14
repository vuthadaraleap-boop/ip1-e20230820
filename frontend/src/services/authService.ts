import { db, nextId } from '@/mock/mockDb'
import type { User } from '@/types'
import { ApiError, respond } from './api'

// Mock login: any password of 8+ characters works for a known email.
// No passwords are stored. The real login with hashed passwords and a JWT comes in M2 and M3.
export function login(email: string, password: string): Promise<User> {
  return respond(() => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user || password.length < 8) throw new ApiError(401, 'Wrong email or password.')
    return user
  })
}

// Registration always creates a MEMBER. The role is never taken from the form.
export function register(input: { name: string; email: string; password: string }): Promise<User> {
  return respond(() => {
    const email = input.email.trim().toLowerCase()
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new ApiError(409, 'This email is already registered.')
    }
    const user: User = { id: nextId(db.users), name: input.name.trim(), email, role: 'MEMBER' }
    db.users.push(user)
    return user
  })
}
