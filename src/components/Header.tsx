import { UserMenu } from './UserMenu'

/**
 * Header component
 * Displays app title and user menu
 */
export const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Rayito Admin</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
