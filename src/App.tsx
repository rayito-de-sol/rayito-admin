import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { GlobalLoading } from '@/components/GlobalLoading'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { StoresPage } from '@/pages/StoresPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { PackagesPage } from '@/pages/PackagesPage'
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
          path="/tiendas"
          element={
            <ProtectedRoute>
              <Layout>
                <StoresPage />
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

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
