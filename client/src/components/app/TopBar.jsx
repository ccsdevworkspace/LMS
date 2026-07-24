import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from '../theme/ThemeToggle'
import { NAV_LINKS, Avatar, btnClass } from './Topbar.utils'

export default function TopBar() {
  const navigate = useNavigate()
  const logout   = useAuthStore((state) => state.logout)
  const profile  = useUserStore((state) => state.profile)
  const [menuOpen, setMenuOpen] = useState(false)
  
  async function handleLogout() {
    await logout()
    navigate('/')
  }
  
  const leftControls = (
    <div className="flex items-center gap-2">
      <Avatar profile={profile} />
      <button onClick={handleLogout} title="Logout" className={`w-9 h-9 md:w-11 md:h-11 ${btnClass}`}>
        <LogOut size={17} strokeWidth={1.8} />
      </button>
      <ThemeToggle className={`w-9 h-9 md:w-11 md:h-11 ${btnClass}`} />
    </div>
  )

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {leftControls}
          {/* nav pill */}
          <nav className="hidden md:flex items-center rounded-full border border-border p-2 gap-1">
              {NAV_LINKS.map(({ label, path }) => (
              <NavLink 
              key={path} 
              to={path} 
              className={({ isActive }) =>
                `px-6 py-2.5 rounded-full text-sm transition-colors ${isActive ? 'bg-primary-100 text-primary-600 font-medium' : 'text-fg-subtle hover:text-fg-muted'}`
              }>
                {label}
              </NavLink>
            ))}
          </nav>

          <button onClick={() => setMenuOpen((p) => !p)}
            className={`md:hidden w-10 h-10 ${btnClass}`}>
            <Menu size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>
      
      {/* menu */}
      <aside 
        className={`md:hidden fixed inset-0 z-40 bg-surface flex flex-col transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <header className="flex items-center justify-between px-4 py-3 shrink-0">
          {leftControls}
          <button 
          onClick={() => setMenuOpen(false)} 
          className={`w-10 h-10 ${btnClass}`}>
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>
        
        <nav className="flex-1 flex flex-col items-center justify-center gap-2 pb-16">
          {NAV_LINKS.map(({ label, path }) => (
            <NavLink 
            key={path} 
            to={path} 
            onClick={() => setMenuOpen(false)} 
            className={({ isActive }) =>
              `px-8 py-3 rounded-full text-2xl font-light tracking-wide transition-colors ${isActive ? 'bg-primary-100 text-primary-600 font-normal' : 'text-fg-subtle hover:text-fg'}`
            }>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}