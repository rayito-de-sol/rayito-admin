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
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">
          {user.fullName || user.email}
        </p>
        <p className="text-xs text-muted-foreground">{user.role}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </div>
  )
}
