import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Wrench,
  Users,
  Bell,
  GraduationCap,
} from 'lucide-react'

const NAV_LINKS = {
  USER: [
    { label: 'Home',      href: '/user/dashboard',      icon: LayoutDashboard },
    { label: 'Resources',      href: '/user/resources',      icon: Building2 },
    { label: 'Reservations',   href: '/user/bookings',       icon: CalendarCheck },
    { label: 'Support Requests', href: '/user/tickets',      icon: Wrench },
    { label: 'Notifications',  href: '/user/notifications',  icon: Bell },
  ],
  ADMIN: [
    { label: 'Dashboard',      href: '/admin/dashboard',     icon: LayoutDashboard },
    { label: 'Resources',      href: '/admin/resources',     icon: Building2 },
    { label: 'Bookings',       href: '/admin/bookings',      icon: CalendarCheck },
    { label: 'Support Requests', href: '/admin/tickets',     icon: Wrench },
    { label: 'Users',          href: '/admin/users',         icon: Users },
    { label: 'Notifications',  href: '/admin/notifications', icon: Bell },
  ],
  TECHNICIAN: [
    { label: 'Dashboard',      href: '/technician/dashboard',     icon: LayoutDashboard },
    { label: 'Assigned Requests', href: '/technician/tickets',    icon: Wrench },
    { label: 'Notifications',  href: '/technician/notifications', icon: Bell },
  ],
}

const ROLE_BADGE = {
  ADMIN:      { label: 'Admin',       cls: 'bg-red-500/15 text-red-100 border border-red-300/20' },
  TECHNICIAN: { label: 'Technician',  cls: 'bg-amber-500/15 text-amber-100 border border-amber-300/20' },
  USER:       { label: 'Student',     cls: 'bg-blue-500/15 text-blue-100 border border-blue-300/20' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = NAV_LINKS[user?.role] || []
  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.USER
  const isActive = (href) => location.pathname === href

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardHref = `/${user?.role?.toLowerCase()}/dashboard`

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#0b1224]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Brand */}
        <Link to={dashboardHref} className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
            <GraduationCap size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none text-white">
              University of Melbourne
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Smart Campus
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                isActive(href)
                  ? 'border border-blue-300/25 bg-blue-500/15 text-white'
                  : 'border border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              <Icon size={16} className={isActive(href) ? 'text-blue-200' : 'text-white/55'} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <NotificationPanel />

          {/* Role badge */}
          <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${badge.cls}`}>
            {badge.label}
          </span>

          {/* Profile */}
          <Link
            to={`/${user?.role?.toLowerCase()}/profile`}
            className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-2.5 py-1.5 transition hover:border-white/10 hover:bg-white/5"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-100 ring-1 ring-blue-300/20">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="hidden max-w-[180px] truncate text-sm text-white/75 sm:block">
              {user?.name}
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-transparent p-2 text-white/60 transition hover:border-red-300/20 hover:bg-red-500/10 hover:text-red-100"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>

          {/* Mobile toggle */}
          <button
            className="rounded-2xl border border-transparent p-2 text-white/70 transition hover:border-white/10 hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0b1224]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex flex-col gap-1">
            {links.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive(href)
                    ? 'border border-blue-300/25 bg-blue-500/15 text-white'
                    : 'border border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white',
                ].join(' ')}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} className={isActive(href) ? 'text-blue-200' : 'text-white/55'} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}