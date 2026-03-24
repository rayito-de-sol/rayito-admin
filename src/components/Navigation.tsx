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
        ? 'bg-[var(--color-sidebar-active)] text-white'
        : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`

  return (
    <nav
      className="w-64 overflow-auto p-4"
      style={{ backgroundColor: 'var(--color-sidebar)' }}
    >
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
