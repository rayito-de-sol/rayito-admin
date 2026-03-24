import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary component
 * Catches rendering errors and displays user-friendly error message
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-md text-center">
            <div className="rounded-lg border border-destructive bg-destructive/10 p-8">
              <h1 className="text-2xl font-bold text-destructive">
                ¡Algo salió mal!
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la
                página.
              </p>
              {this.state.error && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error: {this.state.error.message}
                </p>
              )}
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
