import { UserMenu } from './UserMenu'

/**
 * Header component
 * Displays app logo, title and user menu
 */
export const Header = () => {
  return (
    <header className="border-b border-border bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Rayito Logo"
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-xl font-bold">Rayito Admin</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
