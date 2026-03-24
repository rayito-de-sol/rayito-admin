/**
 * User-related type definitions
 */

export type UserRole = 'admin' | 'manager' | 'analyst'

export interface User {
  id: string
  email: string
  role: UserRole
  fullName: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  fullName: string | null
}
