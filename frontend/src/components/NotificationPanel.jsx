import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, CheckCheck, Trash2, Sparkles, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notifications'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  TICKET_IN_PROGRESS: '🔧',
  TICKET_RESOLVED: '✅',
  TICKET_CLOSED: '🔒',
  TICKET_REJECTED: '❌',
  NEW_COMMENT: '💬',
  SYSTEM: '📢',
}

export default function NotificationPanel() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  const fetchData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [notifRes, countRes] = await Promise.all([
        getAllNotifications(user.userId),
        getUnreadCount(user.userId),
      ])
      setNotifications(notifRes.data)
      setUnreadCount(countRes.data.unreadCount)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkAsRead = async (notifId) => {
    await markAsRead(notifId, user.userId)
    fetchData()
  }

  const handleMarkAll = async () => {
    await markAllAsRead(user.userId)
    fetchData()
  }

  const handleDelete = async (notifId) => {
    await deleteNotification(notifId, user.userId)
    fetchData()
  }

  const recentNotifs = notifications.slice(0, 5)

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={[
          'relative rounded-2xl p-2 transition',
          open ? 'bg-white/5 ring-1 ring-white/10' : 'hover:bg-white/5',
        ].join(' ')}
        style={{ color: 'rgba(255,255,255,0.78)' }}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-[#0b1224]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <Bell size={16} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Notifications</p>
                <p className="text-[11px] text-white/55">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>

              {unreadCount > 0 && (
                <span className="ml-2 hidden rounded-full border border-blue-300/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-100 sm:inline-flex">
                  New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 sm:inline-flex"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} className="text-blue-200" />
                  Mark all
                </button>
              )}

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-4 py-10 text-sm text-white/60">
                <Loader size={16} className="animate-spin text-blue-200" />
                Loading…
              </div>
            ) : recentNotifs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm font-semibold text-white/90">No notifications yet</p>
                <p className="mt-1 text-xs text-white/60">
                  Status updates for reservations and support requests will appear here.
                </p>
              </div>
            ) : (
              recentNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={[
                    'flex gap-3 px-4 py-3 transition',
                    'border-b border-white/10',
                    !notif.isRead ? 'bg-blue-500/10' : 'bg-transparent',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">
                    <span className="text-lg">{TYPE_ICONS[notif.type] || '🔔'}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold leading-snug ${!notif.isRead ? 'text-white' : 'text-white/85'}`}>
                      {notif.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/60">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-[11px] text-white/45">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
                        title="Mark as read"
                      >
                        <Check size={14} className="text-blue-200" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bg-white/5 px-4 py-3 text-center">
            <a
              href={`/${user?.role?.toLowerCase()}/notifications`}
              className="text-xs font-semibold text-blue-200 transition hover:text-blue-100"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}