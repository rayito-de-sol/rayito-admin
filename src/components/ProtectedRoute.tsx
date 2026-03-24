import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 * Preserves intended destination in returnTo query parameter
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  console.log('ProtectedRoute: Checking auth, isAuthenticated:', isAuthenticated, 'location:', location.pathname)

  if (!isAuthenticated) {
    // Redirect to login with returnTo parameter
    const returnTo = location.pathname + location.search
    console.log('ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} />
  }

  console.log('ProtectedRoute: Authenticated, rendering children')
  return <>{children}</>
}
