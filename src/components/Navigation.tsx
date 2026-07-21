import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Store,
  Package,
  Ruler,
  Layers,
  Box,
  ShoppingBag,
  Palette,
  Receipt,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  const [productsOpen, setProductsOpen] = useState(true)
  const [financesOpen, setFinancesOpen] = useState(true)

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
            to="/tiendas"
            className={linkClass}
            title={isCollapsed ? 'Tiendas' : undefined}
          >
            <Store className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Tiendas</span>}
          </NavLink>
        </li>

        <li className="pt-2">
          <NavLink
            to="/ventas"
            className={linkClass}
            title={isCollapsed ? 'Ventas' : undefined}
          >
            <ShoppingBag className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Ventas</span>}
          </NavLink>
        </li>

        {/* Finanzas group */}
        {isCollapsed ? (
          <li className="pt-2">
            <div className="mx-auto h-px w-6 bg-white/20" />
          </li>
        ) : (
          <li className="pt-2">
            <button
              onClick={() => setFinancesOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-expanded={financesOpen}
            >
              <span>Finanzas</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 transition-transform ${
                  financesOpen ? '' : '-rotate-90'
                }`}
              />
            </button>
          </li>
        )}

        {(isCollapsed || financesOpen) && (
          <>
            <li>
              <NavLink
                to="/finanzas/gastos"
                className={linkClass}
                title={isCollapsed ? 'Gastos' : undefined}
              >
                <Receipt className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Gastos</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/finanzas/estados"
                className={linkClass}
                title={isCollapsed ? 'Estados financieros' : undefined}
              >
                <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Estados</span>}
              </NavLink>
            </li>
          </>
        )}

        {/* Productos group */}
        {isCollapsed ? (
          <li className="pt-2">
            <div className="mx-auto h-px w-6 bg-white/20" />
          </li>
        ) : (
          <li className="pt-2">
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-expanded={productsOpen}
            >
              <span>Productos</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 transition-transform ${
                  productsOpen ? '' : '-rotate-90'
                }`}
              />
            </button>
          </li>
        )}

        {(isCollapsed || productsOpen) && (
          <>
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
                to="/variantes"
                className={linkClass}
                title={isCollapsed ? 'Crear Variantes' : undefined}
              >
                <Layers className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Variantes</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/colores"
                className={linkClass}
                title={isCollapsed ? 'Colores' : undefined}
              >
                <Palette className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Colores</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/tallas"
                className={linkClass}
                title={isCollapsed ? 'Tallas' : undefined}
              >
                <Ruler className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Tallas</span>}
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
          </>
        )}
      </ul>
    </nav>
  )
}
