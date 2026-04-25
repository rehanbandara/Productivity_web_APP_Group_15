import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, ShieldCheck, Loader, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notifications'
import { formatDistanceToNow } from 'date-fns'
import Navbar from './Navbar'

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

const TYPE_LABELS = {
  BOOKING_APPROVED: 'Reservation approved',
  BOOKING_REJECTED: 'Reservation not approved',
  TICKET_IN_PROGRESS: 'Support request update',
  TICKET_RESOLVED: 'Support request resolved',
  TICKET_CLOSED: 'Support request closed',
  TICKET_REJECTED: 'Support request not approved',
  NEW_COMMENT: 'New comment',
  SYSTEM: 'System',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await getAllNotifications(user.userId)
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkAsRead = async (id) => {
    await markAsRead(id, user.userId)
    fetchNotifications()
  }

  const handleMarkAll = async () => {
    await markAllAsRead(user.userId)
    fetchNotifications()
  }

  const handleDelete = async (id) => {
    await deleteNotification(id, user.userId)
    fetchNotifications()
  }

  // support both shapes: notif.read (older) and notif.isRead (newer)
  const isRead = (n) => (typeof n.isRead === 'boolean' ? n.isRead : !!n.read)

  const unreadCount = notifications.filter(n => !isRead(n)).length
  const displayed = filter === 'UNREAD'
    ? notifications.filter(n => !isRead(n))
    : notifications

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/75 to-[#1e3a8a]/35" />

          <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              <ShieldCheck size={14} className="text-blue-200" />
              UNIVERSITY OF MELBOURNE
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-3xl font-semibold text-white">
                  <Bell size={22} className="text-blue-200" />
                  Notifications
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  {unreadCount} unread · {notifications.length} total
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                <Sparkles size={14} className="text-blue-200" />
               
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        {/* Actions + filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {['ALL', 'UNREAD'].map(f => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={[
                    'rounded-xl px-4 py-2 text-sm font-semibold transition',
                    active
                      ? 'border border-blue-300/25 bg-blue-500/15 text-white'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {f === 'ALL' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
                </button>
              )
            })}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6]"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-white/60">
            <Loader size={18} className="animate-spin text-blue-200" />
            Loading notifications…
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-16 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
            <Bell size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-sm font-semibold text-white/90">
              No {filter === 'UNREAD' ? 'unread ' : ''}notifications
            </p>
            <p className="mt-2 text-xs text-white/60">
              You’ll see reservation and support updates here as they happen.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(notif => {
              const read = isRead(notif)

              return (
                <div
                  key={notif.id}
                  className={[
                    'flex gap-4 rounded-3xl border p-4 shadow-2xl shadow-black/10 backdrop-blur-xl transition',
                    read
                      ? 'border-white/10 bg-white/10'
                      : 'border-blue-300/20 bg-blue-500/10',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <span className="mt-0.5 shrink-0 text-2xl">
                    {TYPE_ICONS[notif.type] || '🔔'}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${read ? 'text-white/85' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-white/50">
                          {TYPE_LABELS[notif.type] || 'Notification'}
                        </span>
                      </div>

                      {!read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-300" />
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {notif.message}
                    </p>

                    <p className="mt-2 text-xs text-white/45">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2">
                    {!read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
                        title="Mark as read"
                      >
                        <Check size={16} className="text-blue-200" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}