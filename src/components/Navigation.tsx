import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  Store,
  Package,
  Box,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface NavigationProps {
  isCollapsed: boolean
  onToggle: () => void
}

/**
 * Navigation component
 * Displays navigation links with active state highlighting
 * Supports collapsible state to show only icons
 */
export const Navigation = ({ isCollapsed, onToggle }: NavigationProps) => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white text-[var(--color-brand-brown)]'
        : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`

  return (
    <nav
      className="relative overflow-auto p-2 transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-brand-brown)',
        width: isCollapsed ? '60px' : '180px',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute right-2 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white"
        aria-label={isCollapsed ? 'Expandir navegación' : 'Colapsar navegación'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation links */}
      <ul className="mt-12 space-y-2">
        <li>
          <NavLink
            to="/dashboard"
            className={linkClass}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/users"
            className={linkClass}
            title={isCollapsed ? 'Usuarios' : undefined}
          >
            <Users className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Usuarios</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tiendas"
            className={linkClass}
            title={isCollapsed ? 'Tiendas' : undefined}
          >
            <Store className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Tiendas</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/productos"
            className={linkClass}
            title={isCollapsed ? 'Productos' : undefined}
          >
            <Package className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Productos</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/empaques"
            className={linkClass}
            title={isCollapsed ? 'Empaques' : undefined}
          >
            <Box className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Empaques</span>}
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
