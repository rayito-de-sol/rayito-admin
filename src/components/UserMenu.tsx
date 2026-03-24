import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * UserMenu component
 * Displays user name, email, and sign out button
 */
export const UserMenu = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleSignOut = async () => {
    console.log('UserMenu.handleSignOut: Logout button clicked')
    try {
      console.log('UserMenu.handleSignOut: Calling signOut()...')
      await signOut()
      console.log('UserMenu.handleSignOut: signOut() completed successfully')

      // Start polling to check if session is actually gone
      console.log('UserMenu.handleSignOut: Starting session polling to verify logout...')
      const maxAttempts = 10 // 10 attempts * 500ms = 5 seconds
      let attempts = 0

      const pollInterval = setInterval(async () => {
        attempts++
        console.log(`UserMenu.handleSignOut: Polling attempt ${attempts}/${maxAttempts}`)

        const { data: { session } } = await supabase.auth.getSession()
        const { isAuthenticated } = useAuthStore.getState()

        console.log('UserMenu.handleSignOut: Session exists:', !!session, 'Store isAuthenticated:', isAuthenticated)

        if (!session && !isAuthenticated) {
          console.log('UserMenu.handleSignOut: Session cleared and store updated, navigating to login')
          clearInterval(pollInterval)
          navigate('/login', { replace: true })
          return
        }

        if (!session && isAuthenticated) {
          console.log('UserMenu.handleSignOut: Session cleared but store still authenticated, manually clearing and redirecting')
          clearInterval(pollInterval)
          useAuthStore.getState().clearUser()
          navigate('/login', { replace: true })
          return
        }

        if (attempts >= maxAttempts) {
          console.log('UserMenu.handleSignOut: Max polling attempts reached, forcing redirect')
          clearInterval(pollInterval)
          useAuthStore.getState().clearUser()
          navigate('/login', { replace: true })
        }
      }, 500) // Poll every 500ms

    } catch (error) {
      console.error('UserMenu.handleSignOut: Error signing out:', error)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {user.fullName || user.email}
        </p>
        <p className="text-xs text-gray-600">{user.role}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </div>
  )
}
