import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers } from '../../api/users'
import { AdminTicketsContent } from './AdminTicketsPage'
import { getAllBookings } from '../../api/bookings'
import { getAllResources } from '../../api/resources'
import { getAllTickets } from '../../api/tickets'
import {
  Users,
  Building2,
  CalendarCheck,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [userCount, setUserCount] = useState(0)
  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingCount, setBookingCount] = useState(0)
  const [resourceCount, setResourceCount] = useState(0)
  const [openTicketCount, setOpenTicketCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [uRes, bPending, bAll, rRes, tRes] = await Promise.all([
        getAllUsers(),
        getAllBookings('PENDING'),
        getAllBookings(),
        getAllResources(),
        getAllTickets(),
      ])

      setUserCount(uRes.data.length)
      setPendingBookings(bPending.data.slice(0, 5))
      setBookingCount(bAll.data.length)
      setResourceCount(rRes.data.length)
      setOpenTicketCount(tRes.data.filter(t => t.status === 'OPEN').length)
    } catch {
      toast.error('Error fetching dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const STAT_CARDS = [
    { label: 'Total users', icon: Users, value: userCount, path: '/admin/users' },
    { label: 'Resources', icon: Building2, value: resourceCount, path: '/admin/resources' },
    { label: 'Bookings', icon: CalendarCheck, value: bookingCount, path: '/admin/bookings' },
    { label: 'Open tickets', icon: Wrench, value: openTicketCount, path: '/admin/tickets' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
            <ShieldCheck size={14} className="text-blue-200" />
            UNIVERSITY OF MELBOURNE
          </p>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold text-white md:text-4xl">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-white/60">
                System overview for bookings, resources, and support operations.
              </p>
            </div>

            
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map(({ label, icon: Icon, value, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 text-left shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.14]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/15 blur-2xl opacity-70 transition group-hover:opacity-100" />

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <Icon size={20} />
              </div>

              <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-sm text-white/60">{label}</p>

              <ArrowRight
                size={18}
                className="absolute bottom-5 right-5 text-white/35 transition group-hover:translate-x-1 group-hover:text-white/70"
              />
            </button>
          ))}
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending bookings */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Pending bookings</p>
                  <p className="text-xs text-white/60">Most recent requests awaiting approval.</p>
                </div>
              </div>

              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 transition hover:text-blue-100"
              >
                Review all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-white/60">
                <Loader size={16} className="animate-spin text-blue-200" />
                Loading bookings…
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-white/90">No pending bookings</p>
                <p className="mt-2 text-xs text-white/60">
                  You’re all caught up. New requests will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {pendingBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{b.resourceName}</p>
                      <p className="mt-1 text-xs text-white/60">
                        {b.userName} • {b.bookingDate}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                      Pending
                    </span>
                  </div>
                ))}

                <div className="px-6 py-5">
                  <Link
                    to="/admin/bookings"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-blue-100"
                  >
                    Review all bookings <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Tickets widget */}
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <AdminTicketsContent />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-white/45">
          University of Melbourne · Smart Campus Operations Hub · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}