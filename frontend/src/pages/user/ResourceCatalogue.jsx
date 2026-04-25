import { useState, useEffect } from 'react'
import { getAllResources } from '../../api/resources'
import ResourceCard from '../../components/ResourceCard'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import {
  Search,
  X,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  MapPin,
  Users,
  Clock,
  Info,
} from 'lucide-react'

const THEATRE_IMG = '/src/assets/lecture_theatre.jpg'

const TYPE_META = {
  LECTURE_HALL: { icon: '🏛️', label: 'Lecture Halls' },
  LAB:          { icon: '🔬', label: 'Laboratories' },
  MEETING_ROOM: { icon: '🤝', label: 'Meeting Rooms' },
  EQUIPMENT:    { icon: '🎥', label: 'Equipment' },
}

export default function ResourceCatalogue() {
  const [resources, setResources]               = useState([])
  const [loading, setLoading]                   = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)
  const [showFilters, setShowFilters]           = useState(true)

  const [typeFilter, setTypeFilter]             = useState('')
  const [statusFilter, setStatusFilter]         = useState('')
  const [locationFilter, setLocationFilter]     = useState('')
  const [capacityFilter, setCapacityFilter]     = useState('')

  const fetchResources = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (typeFilter)     filters.type        = typeFilter
      if (statusFilter)   filters.status      = statusFilter
      if (locationFilter) filters.location    = locationFilter
      if (capacityFilter) filters.minCapacity = capacityFilter
      const res = await getAllResources(filters)
      setResources(res.data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources() }, [])

  const handleSearch = () => fetchResources()

  const handleClear = () => {
    setTypeFilter('')
    setStatusFilter('')
    setLocationFilter('')
    setCapacityFilter('')
    setTimeout(() => fetchResources(), 100)
  }

  const grouped = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const activeFiltersCount = [typeFilter, statusFilter, locationFilter, capacityFilter].filter(Boolean).length

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white placeholder:text-white/40 ' +
    'border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative h-[340px]">
          <img
            src={THEATRE_IMG}
            alt="Campus facilities"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'center 40%', filter: 'brightness(0.55)' }}
            onError={e => (e.target.style.display = 'none')}
          />

          {/* Fallback gradient + overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/70 to-[#1e3a8a]/35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.40),transparent_55%)]" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-6">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
                  <ShieldCheck size={14} className="text-blue-200" />
                  UNIVERSITY OF MELBOURNE
                </p>

                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                  Facilities &amp; Resources
                </h1>

                <p className="mt-2 text-sm text-white/70 md:text-[15px]">
                  Browse campus spaces and equipment. Filter by type, location, status, or minimum capacity.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/60">
                  
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white/10 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-8 px-6 py-4">
              {Object.entries(TYPE_META).map(([type, meta]) => {
                const count = resources.filter(r => r.type === type).length
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <p className="text-xl font-semibold leading-none text-white">{count}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                        {meta.label}
                      </p>
                    </div>
                  </div>
                )
              })}

              <div className="ml-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs text-white/60">Total</p>
                <p className="text-sm font-semibold text-blue-200">{resources.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 bg-white/5 px-6 py-5 text-left"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <Search size={18} />
              </div>

              

              {activeFiltersCount > 0 && (
                <span className="ml-2 rounded-full border border-blue-300/25 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
                  {activeFiltersCount} active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-white/70">
              <SlidersHorizontal size={16} />
              <span className="text-xs font-semibold">{showFilters ? 'Hide' : 'Show'}</span>
            </div>
          </button>

          {showFilters && (
            <div className="px-6 pb-6 pt-5">
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Type</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={inputClass}>
                    <option value="" className="bg-slate-900">All types</option>
                    <option value="LECTURE_HALL" className="bg-slate-900">🏛️ Lecture Hall</option>
                    <option value="LAB" className="bg-slate-900">🔬 Lab</option>
                    <option value="MEETING_ROOM" className="bg-slate-900">🤝 Meeting Room</option>
                    <option value="EQUIPMENT" className="bg-slate-900">🎥 Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Status</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClass}>
                    <option value="" className="bg-slate-900">All status</option>
                    <option value="ACTIVE" className="bg-slate-900">Active</option>
                    <option value="OUT_OF_SERVICE" className="bg-slate-900">Out of service</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Building name, level, wing…"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Minimum capacity</label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={capacityFilter}
                    onChange={e => setCapacityFilter(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6]"
                >
                  <Search size={16} />
                  Apply filters
                </button>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    <X size={16} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-transparent" />
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-14 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-3xl">🔍</p>
            <p className="mt-3 text-sm font-semibold text-white/90">No resources found</p>
            <p className="mt-1 text-xs text-white/60">Try broadening your filters or clearing them.</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClear}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b82f6]"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        ) : typeFilter ? (
          <>
            <p className="mb-5 text-xs text-white/60">
              Showing <span className="font-semibold text-white">{resources.length}</span>{' '}
              resource{resources.length !== 1 ? 's' : ''}.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} onClick={setSelectedResource} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="mb-5 flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                    <span className="text-xl">{TYPE_META[type]?.icon || '📦'}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {TYPE_META[type]?.label || type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-white/60">{items.length} available</p>
                  </div>
                  <div className="ml-2 h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} onClick={setSelectedResource} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedResource(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                  <span className="text-xl">{TYPE_META[selectedResource.type]?.icon || '📦'}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{selectedResource.name}</p>
                  <p className="text-xs text-white/55">{selectedResource.resourceCode}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status */}
            <div className="border-b border-white/10 px-6 py-3">
              <div
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                  selectedResource.status === 'ACTIVE'
                    ? 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100'
                    : 'border-red-300/20 bg-red-500/10 text-red-100',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-2 w-2 rounded-full',
                    selectedResource.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400',
                  ].join(' ')}
                />
                {selectedResource.status === 'ACTIVE' ? 'Available' : 'Out of service'}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3 px-6 py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Type</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">
                    {TYPE_META[selectedResource.type]?.label || selectedResource.type.replace('_', ' ')}
                  </p>
                </div>

                {selectedResource.capacity && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Capacity</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
                      <Users size={15} className="text-blue-200" />
                      {selectedResource.capacity} people
                    </p>
                  </div>
                )}
              </div>

              {selectedResource.location && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Location</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/85">
                    <MapPin size={15} className="text-blue-200" />
                    {selectedResource.location}
                  </p>
                </div>
              )}

              {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Available hours</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/85">
                    <Clock size={15} className="text-blue-200" />
                    {selectedResource.availabilityStart} – {selectedResource.availabilityEnd}
                  </p>
                </div>
              )}

              {selectedResource.description && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Description</p>
                  <p className="mt-1 flex items-start gap-2 text-sm text-white/80">
                    <Info size={15} className="mt-0.5 text-blue-200" />
                    <span className="leading-relaxed">{selectedResource.description}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedResource(null)}
                className="w-full rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}