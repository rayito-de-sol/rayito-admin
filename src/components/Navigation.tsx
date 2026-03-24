import { NavLink } from 'react-router-dom'
import { Home, Users } from 'lucide-react'

/**
 * Navigation component
 * Displays navigation links with active state highlighting
 */
export const Navigation = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`

  return (
    <nav className="w-64 border-r border-border bg-card p-4">
      <ul className="space-y-2">
        <li>
          <NavLink to="/dashboard" className={linkClass}>
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/users" className={linkClass}>
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
