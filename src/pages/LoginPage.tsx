import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'

/**
 * Login page with Supabase Auth UI
 * Handles authentication and redirects to dashboard or returnTo URL
 */
export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const { error, clearError } = useUIStore()

  // Get returnTo parameter from URL
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, navigate, returnTo])

  // Clear errors on mount
  useEffect(() => {
    clearError()
  }, [clearError])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="Rayito Logo"
            className="mx-auto mb-6 h-40 w-auto object-contain"
          />
          <h1 className="text-3xl font-bold">Rayito Admin</h1>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          {/* Display authentication errors */}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Supabase Auth UI with Spanish localization and brand colors */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7a605d',
                    brandAccent: '#c4b098',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#7a605d',
                    defaultButtonBackgroundHover: '#6a5050',
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'tu@email.com',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Iniciar sesión',
                  loading_button_label: 'Iniciando sesión...',
                  social_provider_text: 'Iniciar sesión con {{provider}}',
                  link_text: '¿Ya tienes una cuenta? Inicia sesión',
                },
                sign_up: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'tu@email.com',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Crear cuenta',
                  loading_button_label: 'Creando cuenta...',
                  social_provider_text: 'Registrarse con {{provider}}',
                  link_text: '¿No tienes cuenta? Regístrate',
                },
                forgotten_password: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'tu@email.com',
                  button_label: 'Enviar instrucciones',
                  loading_button_label: 'Enviando instrucciones...',
                  link_text: '¿Olvidaste tu contraseña?',
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  )
}
