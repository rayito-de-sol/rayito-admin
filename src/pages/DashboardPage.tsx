import { useAuth } from '@/hooks/useAuth'

/**
 * Dashboard page
 * Main landing page after successful authentication
 */
export const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          ¡Bienvenido, {user?.fullName || user?.email}!
        </h1>
        <p className="mt-2 text-gray-600">
          Este es tu panel de administración de Rayito
        </p>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 text-center">
        <h2 className="text-xl font-semibold">Dashboard en construcción</h2>
        <p className="mt-4 text-gray-600">
          Las funcionalidades del dashboard se agregarán próximamente.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Por ahora, puedes navegar usando el menú lateral.
        </p>
      </div>
    </div>
  )
}
