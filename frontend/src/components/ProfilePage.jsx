import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import {
  User,
  Mail,
  Shield,
  LogOut,
  Bell,
  Save,
  Hash,
  ShieldCheck,
  Sparkles,
  Loader,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../api/notifications'
import toast from 'react-hot-toast'

const ROLE_STYLES = {
  ADMIN: {
    label: 'Administrator',
    avatarBg: '#2563eb',
    heroAccent: 'rgba(59,130,246,0.35)',
  },
  TECHNICIAN: {
    label: 'Technician',
    avatarBg: '#f59e0b',
    heroAccent: 'rgba(245,158,11,0.25)',
  },
  USER: {
    label: 'Campus user',
    avatarBg: '#60a5fa',
    heroAccent: 'rgba(96,165,250,0.25)',
  },
}

const PREFERENCE_CONFIG = [
  { type: 'BOOKING_APPROVED',   label: 'Reservation approved',     desc: 'When your reservation is approved by an admin',          icon: '✅', group: 'Reservations' },
  { type: 'BOOKING_REJECTED',   label: 'Reservation not approved', desc: 'When your reservation is declined',                       icon: '❌', group: 'Reservations' },
  { type: 'TICKET_IN_PROGRESS', label: 'In progress',              desc: 'When a technician starts working on your request',        icon: '🔧', group: 'Support requests' },
  { type: 'TICKET_RESOLVED',    label: 'Resolved',                 desc: 'When your request is marked resolved',                    icon: '✅', group: 'Support requests' },
  { type: 'TICKET_CLOSED',      label: 'Closed',                   desc: 'When your request is officially closed',                  icon: '🔒', group: 'Support requests' },
  { type: 'TICKET_REJECTED',    label: 'Not approved',             desc: 'When your request is rejected by an admin',               icon: '❌', group: 'Support requests' },
  { type: 'NEW_COMMENT',        label: 'New comment',              desc: 'When someone comments on your request',                   icon: '💬', group: 'Support requests' },
  { type: 'SYSTEM',             label: 'System announcements',     desc: 'Platform updates and announcements',                      icon: '📢', group: 'System' },
]

const GROUPS = ['Reservations', 'Support requests', 'System']

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.USER
  const isUser = user?.role === 'USER'

  const [enabledTypes, setEnabledTypes] = useState(new Set())
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isUser || !user?.userId) {
      setLoadingPrefs(false)
      return
    }

    getNotificationPreferences(user.userId)
      .then(res => setEnabledTypes(new Set(res.data.enabledTypes)))
      .catch(() => setEnabledTypes(new Set(PREFERENCE_CONFIG.map(p => p.type))))
      .finally(() => setLoadingPrefs(false))
  }, [user])

  const handleToggle = (type) => {
    setEnabledTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const handleToggleGroup = (group) => {
    const groupTypes = PREFERENCE_CONFIG.filter(p => p.group === group).map(p => p.type)
    const allOn = groupTypes.every(t => enabledTypes.has(t))

    setEnabledTypes(prev => {
      const next = new Set(prev)
      groupTypes.forEach(t => (allOn ? next.delete(t) : next.add(t)))
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNotificationPreferences(user.userId, [...enabledTypes])
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/75 to-[#1e3a8a]/35" />

          <div className="relative mx-auto max-w-5xl px-6 py-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              <ShieldCheck size={14} className="text-blue-200" />
              UNIVERSITY OF MELBOURNE
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white">My Profile</h1>
                <p className="mt-2 text-sm text-white/60">
                  Account details{isUser ? ' and notification preferences' : ''}.
                </p>
              </div>

              
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile card */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="relative h-28">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,58,138,1) 100%)',
                  }}
                />
                <div
                  className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl"
                  style={{ backgroundColor: roleStyle.heroAccent }}
                />
                <div className="absolute left-6 top-6 grid h-16 w-16 place-items-center rounded-2xl text-xl font-semibold text-white ring-1 ring-white/10"
                  style={{ backgroundColor: roleStyle.avatarBg }}
                >
                  {initials}
                </div>
              </div>

              <div className="px-6 pb-6 pt-5">
                <p className="text-lg font-semibold text-white">{user?.name}</p>
                <p className="mt-1 text-sm text-white/60">{user?.email || 'Signed in via Google'}</p>

                <span className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                  <Shield size={13} className="mr-2 text-blue-200" />
                  {roleStyle.label}
                </span>
              </div>
            </div>

            {/* Sign out */}
            <div className="rounded-3xl border border-red-300/20 bg-red-500/10 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <p className="text-sm font-semibold text-white">Sign out</p>
              <p className="mt-1 text-xs text-white/60"></p>
              <button
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-white/5 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-white/10"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account details */}
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-base font-semibold text-white">Account details</p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { icon: User, label: 'Full name', value: user?.name },
                  { icon: Mail, label: 'Email address', value: user?.email || 'via Google' },
                  { icon: Shield, label: 'Role', value: roleStyle.label },
                  { icon: Hash, label: 'User ID', value: `#${user?.userId}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-xs text-white/55">
                      <Icon size={14} className="text-blue-200" />
                      {label}
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-white/85">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences (USER only) */}
            {isUser && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-base font-semibold text-white">
                      <Bell size={16} className="text-blue-200" />
                      Notification preferences
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                    {enabledTypes.size}/{PREFERENCE_CONFIG.length} enabled
                  </span>
                </div>

                {loadingPrefs ? (
                  <div className="flex items-center justify-center gap-3 py-10 text-sm text-white/60">
                    <Loader size={16} className="animate-spin text-blue-200" />
                    Loading preferences…
                  </div>
                ) : (
                  <div className="mt-6 space-y-7">
                    {GROUPS.map(group => {
                      const groupItems = PREFERENCE_CONFIG.filter(p => p.group === group)
                      const allOn = groupItems.every(p => enabledTypes.has(p.type))

                      return (
                        <div key={group}>
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                              {group}
                            </p>
                            <button
                              onClick={() => handleToggleGroup(group)}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10"
                            >
                              {allOn ? 'Disable all' : 'Enable all'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {groupItems.map(({ type, label, desc, icon }) => {
                              const on = enabledTypes.has(type)
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => handleToggle(type)}
                                  className={[
                                    'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition',
                                    on
                                      ? 'border-blue-300/25 bg-blue-500/10'
                                      : 'border-white/10 bg-white/5 hover:bg-white/10',
                                  ].join(' ')}
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <span className="text-lg">{icon}</span>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-white/90">{label}</p>
                                      <p className="mt-1 line-clamp-2 text-xs text-white/60">{desc}</p>
                                    </div>
                                  </div>

                                  {/* toggle */}
                                  <div className={`relative h-5 w-10 shrink-0 rounded-full ${on ? 'bg-blue-500/60' : 'bg-white/15'}`}>
                                    <div
                                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                                      style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
                                    />
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving || loadingPrefs}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save preferences
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}