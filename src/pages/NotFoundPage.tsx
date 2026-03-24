import { Link } from 'react-router-dom'

/**
 * 404 Not Found page
 */
export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Página no encontrada</p>
        <p className="mt-2 text-gray-500">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}
