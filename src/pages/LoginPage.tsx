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
    console.log('LoginPage: isAuthenticated changed:', isAuthenticated)
    if (isAuthenticated) {
      console.log('LoginPage: Redirecting to:', returnTo)
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, navigate, returnTo])

  // Clear errors on mount
  useEffect(() => {
    clearError()
  }, [clearError])

  // Poll for auth state every second (backup mechanism if onAuthStateChange doesn't fire)
  useEffect(() => {
    const interval = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && !isAuthenticated) {
        console.log(
          'LoginPage: Found session via polling, triggering manual auth check'
        )
        // Force a manual check - the onAuthStateChange should pick this up
        supabase.auth.refreshSession()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Rayito Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          {/* Display authentication errors */}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Supabase Auth UI with Spanish localization */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(222.2 47.4% 11.2%)',
                    brandAccent: 'hsl(222.2 47.4% 20%)',
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

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Solo usuarios autorizados pueden acceder
        </p>
      </div>
    </div>
  )
}
