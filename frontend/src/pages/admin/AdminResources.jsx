import { useState, useEffect } from 'react'
import { getAllResources, createResource, updateResource, deleteResource } from '../../api/resources'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import {
  ShieldCheck,
  Building2,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Loader,
  MapPin,
  Users,
  Clock,
  Info,
} from 'lucide-react'

const emptyForm = {
  name: '',
  resourceCode: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  description: '',
  status: 'ACTIVE',
  availabilityStart: '',
  availabilityEnd: '',
}

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
}

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // lightweight UI filters (frontend-only)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchResources = async () => {
    try {
      setLoading(true)
      const res = await getAllResources()
      setResources(res.data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources() }, [])

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setForm({
      name: resource.name,
      resourceCode: resource.resourceCode,
      type: resource.type,
      capacity: resource.capacity || '',
      location: resource.location || '',
      description: resource.description || '',
      status: resource.status,
      availabilityStart: resource.availabilityStart || '',
      availabilityEnd: resource.availabilityEnd || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource? This action cannot be undone.')) return
    try {
      await deleteResource(id)
      toast.success('Resource deleted')
      fetchResources()
    } catch {
      toast.error('Failed to delete resource')
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.resourceCode || !form.type) {
      toast.error('Name, Code and Type are required.')
      return
    }

    try {
      setSubmitting(true)
      if (editingResource) {
        await updateResource(editingResource.id, form)
        toast.success('Resource updated')
      } else {
        await createResource(form)
        toast.success('Resource created')
      }
      setShowForm(false)
      setEditingResource(null)
      setForm(emptyForm)
      fetchResources()
    } catch {
      toast.error('Failed to save resource')
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowForm(false)
    setEditingResource(null)
    setForm(emptyForm)
  }

  const filtered = resources.filter(r => {
    const matchSearch =
      !search ||
      [r.name, r.resourceCode, r.location, r.type, r.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchType = typeFilter === 'ALL' || r.type === typeFilter
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter

    return matchSearch && matchType && matchStatus
  })

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white placeholder:text-white/40 ' +
    'border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  const selectBase =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              <ShieldCheck size={14} className="text-blue-200" />
              UNIVERSITY OF MELBOURNE
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white">Resource Management</h1>
            <p className="mt-2 text-sm text-white/60">
              Add, update, and manage bookable spaces and equipment across campus.
            </p>
          </div>

          <button
            onClick={() => { setShowForm(true); setEditingResource(null); setForm(emptyForm) }}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-[#3b82f6] hover:to-[#60a5fa]"
          >
            <Plus size={18} />
            Add resource
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                className={`${inputBase} pl-11`}
                placeholder="Search name, code, location, type…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                <Filter size={14} className="text-blue-200" />
                Filters
              </div>

              <select className={selectBase} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="ALL" className="bg-slate-900">All types</option>
                {Object.keys(TYPE_LABELS).map(t => (
                  <option key={t} value={t} className="bg-slate-900">{TYPE_LABELS[t]}</option>
                ))}
              </select>

              <select className={selectBase} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL" className="bg-slate-900">All statuses</option>
                <option value="ACTIVE" className="bg-slate-900">Active</option>
                <option value="OUT_OF_SERVICE" className="bg-slate-900">Out of service</option>
              </select>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                {filtered.length} shown
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-white/60">
            <Loader size={18} className="animate-spin text-blue-200" />
            <span className="ml-3">Loading resources…</span>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Campus resources</p>
                  <p className="text-xs text-white/60">
                    Manage bookable inventory (spaces + equipment).
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-white/55">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Code</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Capacity</th>
                    <th className="px-6 py-4 font-semibold">Availability</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filtered.map((r) => (
                    <tr key={r.id} className="transition hover:bg-white/[0.06]">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                        {r.description ? (
                          <p className="mt-1 line-clamp-1 text-xs text-white/50">{r.description}</p>
                        ) : (
                          <p className="mt-1 text-xs text-white/40">No description</p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                          {r.resourceCode}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-white/70">
                        {TYPE_LABELS[r.type] || r.type?.replace('_', ' ')}
                      </td>

                      <td className="px-6 py-4 text-white/70">
                        {r.location ? (
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={14} className="text-blue-200/90" />
                            {r.location}
                          </span>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-white/70">
                        {r.capacity ? (
                          <span className="inline-flex items-center gap-2">
                            <Users size={14} className="text-blue-200/90" />
                            {r.capacity}
                          </span>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-white/60">
                        {r.availabilityStart && r.availabilityEnd ? (
                          <span className="inline-flex items-center gap-2">
                            <Clock size={14} className="text-blue-200/90" />
                            {r.availabilityStart} – {r.availabilityEnd}
                          </span>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={[
                            'rounded-full px-2.5 py-1 text-[11px] font-semibold border',
                            r.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-100 border-emerald-300/20'
                              : 'bg-red-500/10 text-red-100 border-red-300/20',
                          ].join(' ')}
                        >
                          {r.status === 'ACTIVE' ? 'Active' : 'Out of service'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                            title="Edit"
                          >
                            <Pencil size={14} className="text-blue-200" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(r.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-white/60">
                  No resources match your filters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(6px)' }}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/5 px-6 py-5">
              <div>
                <p className="text-base font-semibold text-white">
                  {editingResource ? 'Edit resource' : 'Add a new resource'}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Keep codes consistent (e.g., “LH-101”) for easier lookup.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                    Name <span className="text-blue-200">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputBase}
                    placeholder="e.g., Lecture Hall 101"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                      Code <span className="text-blue-200">*</span>
                    </label>
                    <input
                      value={form.resourceCode}
                      onChange={(e) => setForm({ ...form, resourceCode: e.target.value })}
                      className={inputBase}
                      placeholder="e.g., LH-101"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
                      Type <span className="text-blue-200">*</span>
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={selectBase}
                    >
                      <option value="LECTURE_HALL" className="bg-slate-900">Lecture Hall</option>
                      <option value="LAB" className="bg-slate-900">Lab</option>
                      <option value="MEETING_ROOM" className="bg-slate-900">Meeting Room</option>
                      <option value="EQUIPMENT" className="bg-slate-900">Equipment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Capacity</label>
                    <input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      className={inputBase}
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Location</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className={inputBase}
                      placeholder="e.g., Building A, Level 2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputBase} min-h-[84px] resize-none`}
                    rows={2}
                    placeholder="Optional details (AV, accessibility, special instructions)…"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={selectBase}
                  >
                    <option value="ACTIVE" className="bg-slate-900">Active</option>
                    <option value="OUT_OF_SERVICE" className="bg-slate-900">Out of service</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Available from</label>
                    <input
                      type="time"
                      value={form.availabilityStart}
                      onChange={(e) => setForm({ ...form, availabilityStart: e.target.value })}
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Available until</label>
                    <input
                      type="time"
                      value={form.availabilityEnd}
                      onChange={(e) => setForm({ ...form, availabilityEnd: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="mt-0.5 text-blue-200" />
                    <p>
                      Availability hours help students choose valid times during booking. Leave blank if this resource is bookable anytime.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={closeModal}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-[#3b82f6] hover:to-[#60a5fa] disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        {editingResource ? 'Update resource' : 'Create resource'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}