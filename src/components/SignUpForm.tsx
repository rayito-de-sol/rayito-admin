import { useState, FormEvent } from 'react'
import { supabase } from '@/services/supabase'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * Custom sign-up form that validates email with backend before creating Supabase account
 * Prevents orphaned Supabase accounts for non-whitelisted emails
 */
export const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation: email format
    if (!validateEmail(email)) {
      setError('Formato de correo electrónico inválido')
      return
    }

    // Client-side validation: password match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Client-side validation: password length
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setLoading(true)

      // Backend validation: check if email is whitelisted
      const validation = await authApi.validateEmail(email)

      if (!validation.allowed) {
        setError(validation.message || 'Email no autorizado')
        setLoading(false)
        return
      }

      // Email is whitelisted, proceed with Supabase signup
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
      }
      // On success, auth state change listener will handle navigation
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al crear la cuenta. Intente nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={loading}
          className="w-full"
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          required
          disabled={loading}
          className="w-full"
        />
      </div>

      {/* Confirm password field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          Confirmar contraseña
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma tu contraseña"
          required
          disabled={loading}
          className="w-full"
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
