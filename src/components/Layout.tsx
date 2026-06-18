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
    <div className="min-h-screen flex bg-[#080E1A]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 fixed inset-y-0 bg-[#0B1120] border-r border-[#1E2D45]">
        <div className="px-5 py-6 border-b border-[#1E2D45]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#14B8A6,#06B6D4)' }}>
              S
            </div>
            <span className="text-base font-bold text-slate-100">ScrubbedIn</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {SIDEBAR_NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-t border-[#1E2D45]">
        <div className="flex">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-500'
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
