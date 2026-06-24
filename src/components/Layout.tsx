import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard',   icon: '🏠', label: 'Home' },
  { to: '/placement',   icon: '📅', label: 'Prep' },
  { to: '/logs',        icon: '🩺', label: 'Portfolio' },
  { to: '/career',      icon: '🎯', label: 'Career' },
  { to: '/profile',     icon: '👤', label: 'Profile' },
]

const SIDEBAR_NAV = [
  { to: '/dashboard',   icon: '🏠', label: 'Home' },
  { to: '/placement',   icon: '📅', label: 'Prep' },
  { to: '/logs',        icon: '🩺', label: 'Portfolio' },
  { to: '/progress',    icon: '📊', label: 'Progress' },
  { to: '/career',      icon: '🎯', label: 'Career' },
  { to: '/exams',       icon: '📚', label: 'Exams' },
  { to: '/profile',     icon: '👤', label: 'Profile' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 fixed inset-y-0 bg-white border-r border-[#E2E8F0]">
        <div className="px-5 py-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold text-[#1B2B6B] border border-[#1B2B6B]">
              S
            </div>
            <span className="text-base font-bold text-[#1B2B6B]">ScrubbedIn</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {SIDEBAR_NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-[#1B2B6B] bg-[#EEF2FF] border border-[#1B2B6B]/20'
                    : 'text-[#4A5568] hover:text-[#1B2B6B] hover:bg-[#EEF2FF]'
                }`
              }>
              <span className="text-base">{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-56 pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto px-4 py-5 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0]">
        <div className="flex">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-[#1B2B6B]' : 'text-slate-500'
                }`
              }>
              <span className="text-lg leading-none">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
