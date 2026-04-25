import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import {
  CalendarCheck,
  Wrench,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyBookings } from '../../api/bookings'
import { MyTicketsContent } from './MyTicketsPage'

const CAMPUS_IMG = '/src/assets/campus_building.jpg'

const STATUS_META = {
  PENDING: {
    label: 'Pending review',
    pill: 'bg-amber-400/15 text-amber-200 border border-amber-300/20'
  },
  APPROVED: {
    label: 'Approved',
    pill: 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20'
  },
  REJECTED: {
    label: 'Not approved',
    pill: 'bg-red-400/15 text-red-200 border border-red-300/20'
  },
  CANCELLED: {
    label: 'Cancelled',
    pill: 'bg-slate-400/15 text-slate-200 border border-slate-300/20'
  },
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    getMyBookings()
      .then(res => setRecentBookings(res.data.slice(0, 3)))
      .catch(() => {})
  }, [])

  const firstName = user?.name?.split(' ')?.[0] || 'there'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* ── HERO ── */}
      <div className="relative pt-16">
        <div className="relative h-[320px] overflow-hidden">

          <img
            src={CAMPUS_IMG}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'brightness(0.55)' }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/70 to-[#1e3a8a]/35" />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-6xl px-6 pb-10">

              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
                <ShieldCheck size={14} className="text-blue-200" />
                UNIVERSITY OF MELBOURNE 
              </p>

              <h1 className="mt-4 text-3xl md:text-4xl font-semibold">
                Welcome back, <span className="text-blue-200">{firstName}</span>
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Manage bookings, tickets, and campus services in one place.
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ── BOOKINGS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Bookings */}
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <CalendarCheck size={18} className="text-blue-200" />
                <p className="font-semibold">Recent Bookings</p>
              </div>

              <Link
                to="/user/bookings"
                className="text-xs text-blue-200 font-semibold flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="p-10 text-center text-white/60 text-sm">
                No bookings yet.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentBookings.map(b => {
                  const meta = STATUS_META[b.status] || STATUS_META.CANCELLED

                  return (
                    <div
                      key={b.id}
                      className="px-6 py-4 flex justify-between items-center hover:bg-white/5"
                    >
                      <div>
                        <p className="font-semibold text-sm">{b.resourceName}</p>
                        <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                          <Clock size={12} /> {b.bookingDate} · {b.startTime}–{b.endTime}
                        </p>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${meta.pill}`}>
                        {meta.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Support Tickets */}
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <Wrench size={18} className="text-blue-200" />
                <p className="font-semibold">Support Requests</p>
              </div>

              <Link
                to="/user/tickets"
                className="text-xs text-blue-200 font-semibold flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="px-6 py-5">
              <MyTicketsContent />
            </div>
          </div>

        </div>

        
      </div>
    </div>
  )
}