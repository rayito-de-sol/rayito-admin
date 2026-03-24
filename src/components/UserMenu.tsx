import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * UserMenu component
 * Displays user name, email, and sign out button
 */
export const UserMenu = () => {
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    console.log('UserMenu.handleSignOut: Logout button clicked')
    try {
      console.log('UserMenu.handleSignOut: Calling signOut()...')
      await signOut()
      console.log('UserMenu.handleSignOut: signOut() completed successfully')
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
