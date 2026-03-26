import { ReactNode, useState } from 'react'
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navigation
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
