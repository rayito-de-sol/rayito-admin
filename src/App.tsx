import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { GlobalLoading } from '@/components/GlobalLoading'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { PackagesPage } from '@/pages/PackagesPage'
import { VentasPage } from '@/pages/VentasPage'
import { GastosPage } from '@/pages/GastosPage'
import { EstadosFinancierosPage } from '@/pages/EstadosFinancierosPage'
import { VariantsPage } from '@/pages/VariantsPage'
import { SizesPage } from '@/pages/SizesPage'
import { ColorsPage } from '@/pages/ColorsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { initAuth } from '@/services/authInit'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Root redirect component
 * Redirects to dashboard if authenticated, login otherwise
 */
const RootRedirect = () => {
  const { isAuthenticated } = useAuthStore()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function App() {
  useEffect(() => {
    // Initialize authentication state listener
    const cleanup = initAuth()
    return cleanup
  }, [])

  return (
    <BrowserRouter>
      <GlobalLoading />
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/empaques"
          element={
            <ProtectedRoute>
              <Layout>
                <PackagesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <Layout>
                <VentasPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/finanzas/gastos"
          element={
            <ProtectedRoute>
              <Layout>
                <GastosPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/finanzas/estados"
          element={
            <ProtectedRoute>
              <Layout>
                <EstadosFinancierosPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/variantes"
          element={
            <ProtectedRoute>
              <Layout>
                <VariantsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tallas"
          element={
            <ProtectedRoute>
              <Layout>
                <SizesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/colores"
          element={
            <ProtectedRoute>
              <Layout>
                <ColorsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        {/* Ruta anterior: /tiendas pasó a ser /clientes */}
        <Route path="/tiendas" element={<Navigate to="/clientes" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
