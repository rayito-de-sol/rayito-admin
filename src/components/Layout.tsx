import { ReactNode } from 'react'
import { Header } from './Header'
import { Navigation } from './Navigation'

interface LayoutProps {
  children: ReactNode
}

/**
 * Layout component
 * Provides consistent structure for protected pages (header, nav, content)
 */
export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
