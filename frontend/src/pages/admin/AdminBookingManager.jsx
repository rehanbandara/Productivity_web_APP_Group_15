import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getAllBookings, reviewBooking, adminDeleteBooking } from '../../api/bookings'
import {
  CalendarCheck,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  ShieldCheck,
  Sparkles,
  Loader,
  Info,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
// Status metadata for display purposes
const STATUS_META = {
  PENDING:   { label: 'Pending review', pill: 'bg-amber-400/15 text-amber-200 border border-amber-300/20' },
  APPROVED:  { label: 'Approved',       pill: 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20' },
  REJECTED:  { label: 'Not approved',   pill: 'bg-red-400/15 text-red-200 border border-red-300/20' },
  CANCELLED: { label: 'Cancelled',      pill: 'bg-slate-400/15 text-slate-200 border border-slate-300/20' },
}

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ALL']

export default function AdminBookingManager() {
  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [reviewingId, setReviewingId] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchAllForCounts() }, [])
  useEffect(() => { fetchBookings() }, [filter])

  const fetchAllForCounts = async () => {
    try {
      const res = await getAllBookings(undefined)
      setAllBookings(res.data || [])
    } catch {
      setAllBookings([])
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await getAllBookings(filter === 'ALL' ? undefined : filter)
      const list = Array.isArray(res.data) ? res.data : []
      setBookings(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const countFor = (status) =>
    status === 'ALL'
      ? allBookings.length
      : allBookings.filter(b => b.status === status).length

  const handleReview = async (bookingId, approved) => {
    setSubmitting(true)
    try {
      await reviewBooking(bookingId, {
        approved,
        remarks: remarks || (approved ? 'Approved by admin.' : 'Rejected by admin.'),
      })
      toast.success(approved ? 'Reservation approved' : 'Reservation not approved')
      setReviewingId(null)
      setRemarks('')
      fetchBookings()
      fetchAllForCounts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminDelete = async (id, resourceName) => {
    if (!confirm(`Permanently delete the reservation record for "${resourceName}"?`)) return
    try {
      await adminDeleteBooking(id)
      toast.success('Reservation record deleted')
      fetchBookings()
      fetchAllForCounts()
    } catch {
      toast.error('Failed to delete reservation')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
            <ShieldCheck size={14} className="text-blue-200" />
            UNIVERSITY OF MELBOURNE
          </p>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold text-white md:text-4xl">Booking Management</h1>
              <p className="mt-2 text-sm text-white/60">
                Review, approve, and manage campus space reservations.
              </p>
            </div>

            
          </div>
        </div>

        {/* Filter Buttons with counts */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map(f => {
            const count = countFor(f)
            const isActive = filter === f
            const label = f === 'ALL' ? 'All' : (STATUS_META[f]?.label || f)

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition',
                  isActive
                    ? 'border border-blue-300/25 bg-blue-500/15 text-white'
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {label}
                {count > 0 && (
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[11px]',
                      isActive ? 'bg-blue-400/20 text-blue-100' : 'bg-white/10 text-white/70',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* List Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <CalendarCheck size={18} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  {filter === 'ALL' ? 'All reservation records' : `${STATUS_META[filter]?.label || filter} requests`}
                </p>
                <p className="text-xs text-white/60">
                  Review details, then approve or decline with remarks.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              {bookings.length} shown
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm text-white/60">
              <Loader size={18} className="animate-spin text-blue-200" />
              Loading bookings…
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-semibold text-white/90">No bookings for this filter</p>
              <p className="mt-2 text-xs text-white/60">
                Try switching filters or check back later.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {bookings.map(booking => {
                const status = booking.status
                const meta = STATUS_META[status] || { label: status, pill: 'bg-white/10 text-white/80 border border-white/10' }
                const isReviewing = reviewingId === booking.id

                return (
                  <div key={booking.id} className="px-6 py-6 transition hover:bg-white/[0.06]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-white">{booking.resourceName || 'Unknown Resource'}</h3>
                            <p className="text-xs text-white/60">Requested by {booking.userName || 'Unknown User'}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.pill}`}>
                            {meta.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <CalendarCheck size={14} className="text-white/40" />
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <Clock size={14} className="text-white/40" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <Users size={14} className="text-white/40" />
                            <span>{booking.purpose || 'General purpose'}</span>
                          </div>
                        </div>

                        {booking.adminRemarks && (
                          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <p className="text-xs text-white/60">Admin remarks:</p>
                            <p className="mt-1 text-xs text-white/80">{booking.adminRemarks}</p>
                          </div>
                        )}

                        {booking.userEmail && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Info size={14} className="text-white/40" />
                            <span>Contact: {booking.userEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:ml-4">
                        {status === 'PENDING' && !isReviewing && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setReviewingId(booking.id)
                                setRemarks('')
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
                            >
                              <CheckCircle size={14} />
                              Review
                            </button>
                            <button
                              onClick={() => handleAdminDelete(booking.id, booking.resourceName || 'Unknown')}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}

                        {isReviewing && (
                          <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                            <textarea
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Add remarks (optional)"
                              className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-white/40 focus:border-blue-400/30 focus:outline-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReview(booking.id, true)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                              >
                                <CheckCircle size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReview(booking.id, false)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setReviewingId(null)
                                  setRemarks('')
                                }}
                                disabled={submitting}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {status !== 'PENDING' && (
                          <button
                            onClick={() => handleAdminDelete(booking.id, booking.resourceName || 'Unknown')}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-blue-100"
          >
            Back to dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}