import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import {
  createBooking, getMyBookings, cancelBooking,
  checkAvailability, deleteBooking, getActiveResources
} from '../../api/bookings'
import {
  CalendarCheck,
  Clock,
  Users,
  Plus,
  X,
  ChevronDown,
  Trash2,
  Loader,
  MapPin,
  Info,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

const LECTURE_HALL_IMG = '/src/assets/lecture_hall.jpg'

const STATUS_META = {
  PENDING:   { label: 'Pending review',   pill: 'bg-amber-400/15 text-amber-200 border border-amber-300/20' },
  APPROVED:  { label: 'Approved',         pill: 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20' },
  REJECTED:  { label: 'Not approved',     pill: 'bg-red-400/15 text-red-200 border border-red-300/20' },
  CANCELLED: { label: 'Cancelled',        pill: 'bg-slate-400/15 text-slate-200 border border-slate-300/20' },
}

const TYPE_LABELS = {
  LECTURE_HALL: '🏛️ Lecture Halls',
  LAB:          '🔬 Labs',
  MEETING_ROOM: '🤝 Meeting Rooms',
  EQUIPMENT:    '🎥 Equipment',
}

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1 text-xs text-red-200">{msg}</p> : null

export default function UserBookings() {
  const { user } = useAuth()
  const [showForm, setShowForm]                 = useState(false)
  const [bookings, setBookings]                 = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [activeFilter, setActiveFilter]         = useState('ALL')
  const [loadingBookings, setLoadingBookings]   = useState(true)
  const [submitting, setSubmitting]             = useState(false)
  const [conflicts, setConflicts]               = useState([])
  const [formErrors, setFormErrors]             = useState({})
  const [resources, setResources]               = useState([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)

  const [form, setForm] = useState({
    resourceId: '', resourceName: '', bookingDate: '',
    startTime: '', endTime: '', purpose: '', expectedAttendees: '',
  })

  useEffect(() => { fetchResources(); fetchBookings() }, [])

  useEffect(() => {
    setFilteredBookings(
      activeFilter === 'ALL' ? bookings : bookings.filter(b => b.status === activeFilter)
    )
  }, [activeFilter, bookings])

  useEffect(() => {
    if (form.resourceId && form.bookingDate) fetchAvailability()
  }, [form.resourceId, form.bookingDate])

  const fetchResources = async () => {
    setLoadingResources(true)
    try { const res = await getActiveResources(); setResources(res.data) }
    catch { toast.error('Failed to load resources') }
    finally { setLoadingResources(false) }
  }

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await getMyBookings()
      setBookings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch { toast.error('Failed to load bookings') }
    finally { setLoadingBookings(false) }
  }

  const fetchAvailability = async () => {
    try { const res = await checkAvailability(form.resourceId, form.bookingDate); setConflicts(res.data) }
    catch {}
  }

  const handleResourceChange = (e) => {
    const id = parseInt(e.target.value)
    const resource = resources.find(r => r.id === id)
    setSelectedResource(resource)
    setForm(prev => ({ ...prev, resourceId: id, resourceName: resource?.name || '' }))
    setFormErrors(prev => ({ ...prev, resourceId: undefined }))
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFormErrors(prev => ({ ...prev, [e.target.name]: undefined }))
  }

  const isTimeAvailable = () => {
    if (!selectedResource?.availabilityStart || !selectedResource?.availabilityEnd) return true
    if (!form.startTime || !form.endTime) return true
    const availStart = selectedResource.availabilityStart.substring(0, 5)
    const availEnd   = selectedResource.availabilityEnd.substring(0, 5)
    return form.startTime >= availStart && form.endTime <= availEnd
  }

  const validate = () => {
    const errors = {}
    if (!form.resourceId) errors.resourceId = 'Please choose a resource to reserve.'
    if (!form.bookingDate) errors.bookingDate = 'Select a date for your reservation.'
    if (!form.startTime) errors.startTime = 'Start time is required.'
    if (!form.endTime) errors.endTime = 'End time is required.'
    if (form.startTime && form.endTime) {
      if (form.startTime >= form.endTime) {
        errors.endTime = 'End time must be after start time.'
      } else {
        const [sh, sm] = form.startTime.split(':').map(Number)
        const [eh, em] = form.endTime.split(':').map(Number)
        if ((eh * 60 + em) - (sh * 60 + sm) < 15) errors.endTime = 'Reservations must be at least 15 minutes.'
      }
    }
    if (form.startTime && form.endTime && !errors.startTime && !errors.endTime && !isTimeAvailable()) {
      errors.startTime = `This resource is available ${selectedResource.availabilityStart?.substring(0, 5)} – ${selectedResource.availabilityEnd?.substring(0, 5)}.`
    }
    if (!form.purpose.trim()) errors.purpose = 'Add a short purpose (e.g., “Tutorial session”).'
    else if (form.purpose.trim().length < 5) errors.purpose = 'Please use at least 5 characters.'
    if (selectedResource && selectedResource.type !== 'EQUIPMENT' && form.expectedAttendees) {
      const count = parseInt(form.expectedAttendees)
      if (isNaN(count) || count < 1) errors.expectedAttendees = 'Must be at least 1.'
      else if (selectedResource.capacity && count > selectedResource.capacity)
        errors.expectedAttendees = `This exceeds the capacity of ${selectedResource.capacity}.`
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    setSubmitting(true)
    try {
      await createBooking({
        ...form,
        resourceId: parseInt(form.resourceId),
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
      })
      toast.success('Reservation submitted — awaiting approval.')
      setShowForm(false)
      setForm({ resourceId: '', resourceName: '', bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' })
      setSelectedResource(null); setConflicts([]); setFormErrors({})
      fetchBookings()
    } catch (err) {
      if (err.response?.status === 409) toast.error('⚠️ ' + (err.response.data.error || 'That time slot is already reserved.'))
      else toast.error(err.response?.data?.error || 'Failed to submit reservation')
    } finally { setSubmitting(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return
    try { await cancelBooking(id); toast.success('Reservation cancelled'); fetchBookings() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to cancel') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this reservation record?')) return
    try { await deleteBooking(id); toast.success('Deleted'); fetchBookings() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to delete') }
  }

  const countByStatus = (s) => bookings.filter(b => b.status === s).length

  const groupedResources = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]

  // Blue SaaS theme helpers (Tailwind-first; minimal inline)
  const inputClass = (field) => (
    `w-full rounded-xl px-4 py-3 text-sm outline-none transition
     bg-white/10 text-white placeholder:text-white/40
     border ${formErrors[field] ? 'border-red-300/50' : 'border-white/15'}
     focus:ring-2 ${formErrors[field] ? 'focus:ring-red-400/30' : 'focus:ring-blue-400/30'}
     focus:border ${formErrors[field] ? 'focus:border-red-300/60' : 'focus:border-blue-300/40'}`
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative h-[280px]">
          <img
            src={LECTURE_HALL_IMG}
            alt="University of Melbourne campus spaces"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'center 35%', filter: 'brightness(0.5)' }}
            onError={e => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/70 to-[#1e3a8a]/35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_55%)]" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-5xl px-6">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
                  <ShieldCheck size={14} className="text-blue-200" />
                  UNIVERSITY OF MELBOURNE 
                </p>

                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                  My Reservations
                </h1>

                <p className="mt-2 text-sm text-white/70 md:text-[15px]">
                  Reserve lecture halls, labs, meeting rooms, and equipment - with real-time availability and approval tracking.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                  >
                    <Plus size={16} />
                    {showForm ? 'Close request form' : 'Reserve Space'}
                  </button>

                  <div className="text-xs text-white/60">
                    {bookings.length} total reservation{bookings.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header row */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/85">Quick Access</p>
           
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <p className="text-xs text-white/60">Signed in as</p>
              <p className="text-sm font-semibold text-white">{user?.name || user?.email || 'Student'}</p>
            </div>
          </div>
        </div>

        {/* ── Booking Form ── */}
        {showForm && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">New reservation request</p>
                  <p className="text-xs text-white/60">
                    Submit once — we’ll notify you when it’s approved.
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setShowForm(false); setFormErrors({}) }}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Resource */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                    Resource <span className="text-blue-200">*</span>
                  </label>

                  {loadingResources ? (
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                      <Loader size={16} className="animate-spin" />
                      Loading available resources…
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="resourceId"
                        value={form.resourceId}
                        onChange={handleResourceChange}
                        className={`${inputClass('resourceId')} appearance-none pr-10`}
                      >
                        <option value="" className="bg-slate-900">
                          — Choose a resource —
                        </option>
                        {Object.entries(groupedResources).map(([type, typeResources]) => (
                          <optgroup key={type} label={TYPE_LABELS[type] || type}>
                            {typeResources.map(r => (
                              <option key={r.id} value={r.id} className="bg-slate-900">
                                {r.name}{r.resourceCode ? ` (${r.resourceCode})` : ''}{r.capacity ? ` — Capacity: ${r.capacity}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
                    </div>
                  )}
                  <FieldError msg={formErrors.resourceId} />
                </div>

                {/* Resource info */}
                {selectedResource && (
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{selectedResource.name}</p>
                          <p className="mt-1 text-xs text-white/60">
                            Review details before submitting your reservation.
                          </p>
                        </div>

                        {selectedResource.type && (
                          <span className="rounded-full border border-blue-200/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                            {TYPE_LABELS[selectedResource.type] || selectedResource.type}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {selectedResource.location && (
                          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                            <MapPin size={16} className="mt-0.5 text-blue-200" />
                            <div>
                              <p className="text-xs text-white/60">Location</p>
                              <p className="text-sm text-white/90">{selectedResource.location}</p>
                            </div>
                          </div>
                        )}

                        {selectedResource.capacity && (
                          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                            <Users size={16} className="mt-0.5 text-blue-200" />
                            <div>
                              <p className="text-xs text-white/60">Capacity</p>
                              <p className="text-sm text-white/90">{selectedResource.capacity} people</p>
                            </div>
                          </div>
                        )}

                        {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:col-span-2">
                            <Clock size={16} className="mt-0.5 text-blue-200" />
                            <div>
                              <p className="text-xs text-white/60">Available hours</p>
                              <p className="text-sm text-white/90">
                                {selectedResource.availabilityStart.substring(0, 5)} – {selectedResource.availabilityEnd.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedResource.description && (
                          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:col-span-2">
                            <Info size={16} className="mt-0.5 text-blue-200" />
                            <div>
                              <p className="text-xs text-white/60">Notes</p>
                              <p className="text-sm text-white/80">{selectedResource.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                    Date <span className="text-blue-200">*</span>
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={form.bookingDate}
                    onChange={handleChange}
                    min={today}
                    className={inputClass('bookingDate')}
                  />
                  <FieldError msg={formErrors.bookingDate} />
                </div>

                {/* Purpose */}
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                    Purpose <span className="text-blue-200">*</span>
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    placeholder="e.g., COMP30023 tutorial, student society meeting"
                    maxLength={255}
                    className={inputClass('purpose')}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <FieldError msg={formErrors.purpose} />
                    <span className="text-xs text-white/40">{form.purpose.length}/255</span>
                  </div>
                </div>

                {/* Conflicts */}
                {conflicts.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
                      <p className="text-sm font-semibold text-amber-100">
                        Times already reserved for this date
                      </p>
                      <p className="mt-1 text-xs text-amber-100/70">
                        Choose a different time to avoid overlapping requests.
                      </p>
                      <div className="mt-3 space-y-2">
                        {conflicts.map(c => (
                          <div
                            key={c.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/15 bg-black/10 px-3 py-2"
                          >
                            <div className="text-sm text-amber-50">
                              {c.startTime} – {c.endTime}
                            </div>
                            <span className="rounded-full border border-amber-300/20 bg-amber-400/15 px-2.5 py-0.5 text-xs font-semibold text-amber-100">
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Time */}
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                    Start time <span className="text-blue-200">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className={inputClass('startTime')}
                  />
                  <FieldError msg={formErrors.startTime} />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                    End time <span className="text-blue-200">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className={inputClass('endTime')}
                  />
                  <FieldError msg={formErrors.endTime} />
                </div>

                {/* Attendees */}
                {selectedResource && selectedResource.type !== 'EQUIPMENT' && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                      Expected attendees{' '}
                      {selectedResource.capacity && (
                        <span className="font-normal text-white/50">(max {selectedResource.capacity})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="expectedAttendees"
                      value={form.expectedAttendees}
                      onChange={handleChange}
                      min={1}
                      max={selectedResource.capacity || undefined}
                      placeholder="e.g., 30"
                      className={inputClass('expectedAttendees')}
                    />
                    <FieldError msg={formErrors.expectedAttendees} />
                  </div>
                )}

                {/* Submit */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-[#3b82f6] hover:to-[#60a5fa] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CalendarCheck size={16} />
                        Submit reservation request
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-xs text-white/50">
                    Tip: For faster approval, include course codes or event details in the purpose field.
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Bookings List ── */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {/* List header */}
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <CalendarCheck size={18} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Reservation history</p>
                
              </div>
            </div>

            <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              {filteredBookings.length} record{filteredBookings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-4">
            {FILTERS.map(f => {
              const isActive = activeFilter === f
              const count = f === 'ALL' ? bookings.length : countByStatus(f)

              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition',
                    isActive
                      ? 'border border-blue-300/25 bg-blue-500/15 text-white'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  <span>{f === 'ALL' ? 'All' : (STATUS_META[f]?.label || f)}</span>
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

          {/* Rows */}
          {loadingBookings ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-transparent" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-white/85">
                {activeFilter === 'ALL' ? 'No reservations yet' : `No ${STATUS_META[activeFilter]?.label?.toLowerCase() || activeFilter.toLowerCase()} reservations`}
              </p>
              <p className="mt-2 text-xs text-white/60">
                {activeFilter === 'ALL'
                  ? 'Use “Reserve Space” to request a lecture hall, lab, meeting room, or equipment.'
                  : 'Try switching filters or create a new reservation request.'}
              </p>
              {activeFilter === 'ALL' && (
                <div className="mt-5">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6]"
                  >
                    <Plus size={16} />
                    Reserve Space
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredBookings.map((booking) => {
                const meta = STATUS_META[booking.status] || { label: booking.status, pill: 'bg-white/10 text-white/80 border border-white/10' }
                const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED'
                const canDelete = booking.status === 'REJECTED' || booking.status === 'CANCELLED'

                return (
                  <div
                    key={booking.id}
                    className="group px-6 py-5 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {booking.resourceName}
                          </p>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.pill}`}>
                            {meta.label}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/65">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarCheck size={13} className="text-blue-200/90" />
                            {booking.bookingDate}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} className="text-blue-200/90" />
                            {booking.startTime} – {booking.endTime}
                          </span>
                          {booking.expectedAttendees && (
                            <span className="inline-flex items-center gap-1.5">
                              <Users size={13} className="text-blue-200/90" />
                              {booking.expectedAttendees} attendee{booking.expectedAttendees !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-white/55">
                          {booking.purpose}
                        </p>

                        {booking.adminRemarks && (
                          <div className="mt-3 rounded-2xl border border-blue-200/15 bg-blue-500/10 px-3 py-2">
                            <p className="text-xs font-semibold text-blue-100">Staff note</p>
                            <p className="mt-1 text-xs text-blue-50/80">{booking.adminRemarks}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2 md:ml-4">
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                          >
                            Cancel
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                            title="Delete permanently"
                          >
                            <Trash2 size={16} />
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

        <p className="mt-6 text-center text-xs text-white/45">
          University of Melbourne
        </p>
      </div>
    </div>
  )
}