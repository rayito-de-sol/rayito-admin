import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { SignUpForm } from '@/components/SignUpForm'

type AuthView = 'sign-in' | 'sign-up'

/**
 * Login page with toggle between sign-in (Supabase Auth UI) and sign-up (custom form)
 * Custom sign-up form validates email with backend before creating Supabase account
 */
export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const { error, clearError } = useUIStore()
  const [view, setView] = useState<AuthView>('sign-in')

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
        {/* Logo and header - visible for both views */}
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="Rayito Logo"
            className="mx-auto mb-6 h-40 w-auto object-contain"
          />
          <h1 className="text-3xl font-bold">Rayito Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === 'sign-in'
              ? 'Ingresa tus credenciales para acceder'
              : 'Crea tu cuenta para comenzar'}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          {/* Display authentication errors */}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Sign-in view: Supabase Auth UI */}
          {view === 'sign-in' && (
            <>
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
                  style: {
                    anchor: {
                      display: 'none', // Hide the default "Don't have an account? Sign up" link
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
                view="sign_in"
              />
              {/* Toggle to sign-up */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setView('sign-up')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ¿No tienes cuenta?{' '}
                  <span className="font-medium text-primary">Regístrate</span>
                </button>
              </div>
            </>
          )}

          {/* Sign-up view: Custom form */}
          {view === 'sign-up' && (
            <>
              <SignUpForm />
              {/* Toggle to sign-in */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setView('sign-in')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ¿Ya tienes una cuenta?{' '}
                  <span className="font-medium text-primary">Inicia sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
