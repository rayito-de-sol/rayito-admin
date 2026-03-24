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
        <h1 className="text-3xl font-bold text-foreground">
          ¡Bienvenido, {user?.fullName || user?.email}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Este es tu panel de administración de Rayito
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Dashboard en construcción
        </h2>
        <p className="mt-4 text-muted-foreground">
          Las funcionalidades del dashboard se agregarán próximamente.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Por ahora, puedes navegar usando el menú lateral.
        </p>
      </div>
    </div>
  )
}
