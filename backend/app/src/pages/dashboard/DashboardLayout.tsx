import { useAuth } from '@/hooks/useAuth'
import { Link, useLocation, Outlet, useNavigate } from 'react-router'
import { useEffect } from 'react'

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { label: 'Products', path: '/dashboard/products', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  )},
  { label: 'Conversations', path: '/dashboard/conversations', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  )},
  { label: 'FAQs', path: '/dashboard/faqs', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
  )},
  { label: 'AI Chat Test', path: '/dashboard/ai-test', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a8 8 0 00-8 8c0 3.866 3.134 7 7 7h2c3.866 0 7-3.134 7-7a8 8 0 00-8-8z"/><path d="M9.5 10a.5.5 0 110-1 .5.5 0 010 1z"/><path d="M14.5 10a.5.5 0 110-1 .5.5 0 010 1z"/><path d="M10 14c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5"/></svg>
  )},
]

export default function DashboardLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]">
        <div className="font-body text-[#8a8580]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f5f3ef]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1814] flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-[rgba(245,243,239,0.08)]">
          <Link to="/" className="font-display text-lg tracking-normal">
            <span className="text-[#f5f3ef]">Business</span>
            <span className="text-[#d4a574]">AI</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-[rgba(212,165,116,0.12)] text-[#d4a574]'
                    : 'text-[#8a8580] hover:text-[#f5f3ef] hover:bg-[rgba(245,243,239,0.05)]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-[rgba(245,243,239,0.08)]">
          <div className="flex items-center gap-3 px-2">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#d4a574] flex items-center justify-center font-body text-xs font-semibold text-[#1a1814]">
                {(user?.name || 'U')[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-[#f5f3ef] truncate">
                {user?.name || 'User'}
              </p>
              <p className="font-body text-xs text-[#8a8580] truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full text-left px-2 py-2 font-body text-xs text-[#8a8580] hover:text-[#d4a574] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
