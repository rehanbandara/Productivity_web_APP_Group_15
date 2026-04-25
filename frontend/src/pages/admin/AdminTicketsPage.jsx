import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
  getAllTickets,
  updateTicketStatus,
  assignTicket,
  addComment,
  editComment,
  deleteComment,
  deleteTicket,
  getUserById,
} from '../../api/tickets'
import {
  Wrench,
  ChevronDown,
  Send,
  Paperclip,
  X,
  User,
  MapPin,
  Tag,
  Clock,
  Trash2,
  ShieldCheck,
  Search,
  Filter,
  Loader,
  Info,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Modern blue SaaS palette
const STATUS_COLORS = {
  OPEN:        'bg-blue-400/15 text-blue-200 border border-blue-300/20',
  IN_PROGRESS: 'bg-amber-400/15 text-amber-200 border border-amber-300/20',
  RESOLVED:    'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20',
  CLOSED:      'bg-slate-400/15 text-slate-200 border border-slate-300/20',
  REJECTED:    'bg-red-400/15 text-red-200 border border-red-300/20',
}

const PRIORITY_COLORS = {
  LOW:      'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20',
  MEDIUM:   'bg-amber-400/15 text-amber-200 border border-amber-300/20',
  HIGH:     'bg-orange-400/15 text-orange-200 border border-orange-300/20',
  CRITICAL: 'bg-red-400/15 text-red-200 border border-red-300/20',
}

const STATUS_FLOW = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
}

export function AdminTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]                 = useState([])
  const [loading, setLoading]                 = useState(true)
  const [selectedTicket, setSelectedTicket]   = useState(null)
  const [statusForm, setStatusForm]           = useState({ status: '', rejectionReason: '', resolutionNote: '' })
  const [updating, setUpdating]               = useState(false)
  const [assigneeId, setAssigneeId]           = useState('')
  const [comment, setComment]                 = useState('')
  const [editingComment, setEditingComment]   = useState(null)
  const [filterStatus, setFilterStatus]       = useState('ALL')
  const [filterPriority, setFilterPriority]   = useState('ALL')
  const [search, setSearch]                   = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await getAllTickets()
      setTickets(res.data)
    } catch {
      toast.error('Failed to load support requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id)
      if (updated) setSelectedTicket(updated)
    }
  }, [tickets])

  const handleStatusUpdate = async (ticketId) => {
    if (!statusForm.status) return toast.error('Select a status')
    if (statusForm.status === 'REJECTED' && !statusForm.rejectionReason.trim()) {
      return toast.error('Rejection reason is required')
    }

    try {
      setUpdating(true)
      await updateTicketStatus(ticketId, {
        status: statusForm.status,
        rejectionReason: statusForm.rejectionReason || null,
        resolutionNote: statusForm.resolutionNote || null,
        updatedByUserId: user.userId,
      })
      toast.success('Status updated')
      setStatusForm({ status: '', rejectionReason: '', resolutionNote: '' })
      fetchTickets()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleAssign = async (ticketId) => {
    if (!assigneeId.trim()) return toast.error('Enter a technician user ID')

    try {
      setUpdating(true)

      const userRes = await getUserById(parseInt(assigneeId))
      const targetUser = userRes.data
      if (!targetUser.roles || !targetUser.roles.includes('TECHNICIAN')) {
        toast.error('This user is not a technician')
        return
      }

      await assignTicket(ticketId, {
        assigneeId: parseInt(assigneeId),
        adminUserId: user.userId,
      })

      toast.success('Technician assigned')
      setAssigneeId('')
      fetchTickets()
    } catch {
      toast.error('User not found or not a technician')
    } finally {
      setUpdating(false)
    }
  }

  const handleComment = async (ticketId) => {
    if (!comment.trim()) return
    try {
      await addComment(ticketId, { content: comment, authorId: user.userId })
      toast.success('Comment added')
      setComment('')
      fetchTickets()
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editingComment?.content.trim()) return
    try {
      await editComment(commentId, { content: editingComment.content, authorId: user.userId })
      toast.success('Comment updated')
      setEditingComment(null)
      fetchTickets()
    } catch {
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId, user.userId)
      toast.success('Comment deleted')
      fetchTickets()
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId, user.userId)
      toast.success('Support request deleted')
      setConfirmDeleteId(null)
      setSelectedTicket(null)
      fetchTickets()
    } catch {
      toast.error('Failed to delete support request')
    }
  }

  const filtered = tickets.filter(t => {
    const matchStatus   = filterStatus === 'ALL' || t.status === filterStatus
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    const matchSearch   =
      !search ||
      [t.title, t.reporterName, t.location, t.category]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

    return matchStatus && matchPriority && matchSearch
  })

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white placeholder:text-white/40 ' +
    'border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  const selectBase =
    'rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
            <ShieldCheck size={14} className="text-blue-200" />
            UNIVERSITY OF MELBOURNE
          </p>
          <h2 className="mt-4 flex items-center gap-2 text-2xl font-semibold text-white">
            <Wrench size={22} className="text-blue-200" />
            Support Requests
            {!loading && (
              <span className="text-sm font-normal text-white/50">
                ({filtered.length} shown)
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Assign technicians, update statuses, and coordinate resolution across campus.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <Info size={14} className="text-blue-200" />
          Rejections require a reason. Resolutions can include an optional note.
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              className={`${inputBase} pl-11`}
              placeholder="Search by title, reporter, location, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <Filter size={14} className="text-blue-200" />
              Filters
            </div>

            <select
              className={selectBase}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="ALL" className="bg-slate-900">All statuses</option>
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>

            <select
              className={selectBase}
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
            >
              <option value="ALL" className="bg-slate-900">All priorities</option>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                <option key={p} value={p} className="bg-slate-900">{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-white/60">
          <Loader size={18} className="animate-spin text-blue-200" />
          <span className="ml-3">Loading support requests…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-12 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-sm font-semibold text-white/90">No matching requests</p>
          <p className="mt-2 text-xs text-white/60">
            Try clearing filters or broadening your search.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => {
            const isExpanded = selectedTicket?.id === ticket.id
            const allowedStatuses = STATUS_FLOW[ticket.status] || []

            return (
              <div
                key={ticket.id}
                className={[
                  'overflow-hidden rounded-3xl border bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-xl transition',
                  isExpanded ? 'border-blue-300/25' : 'border-white/10 hover:bg-white/[0.14]',
                ].join(' ')}
              >
                <button
                  type="button"
                  className="w-full cursor-pointer px-5 py-5 text-left"
                  onClick={() => {
                    setSelectedTicket(isExpanded ? null : ticket)
                    setComment('')
                    setEditingComment(null)
                    setStatusForm({ status: '', rejectionReason: '', resolutionNote: '' })
                    setAssigneeId('')
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="truncate text-base font-semibold text-white">{ticket.title}</span>

                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>

                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-blue-200/90" />
                          {ticket.reporterName}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-blue-200/90" />
                          {ticket.location}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Tag size={14} className="text-blue-200/90" />
                          {ticket.category}
                        </span>

                        {ticket.createdAt && (
                          <span className="ml-auto inline-flex items-center gap-1.5 text-white/45">
                            <Clock size={14} />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {ticket.assigneeName && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
                          <Wrench size={14} className="text-blue-200" />
                          Assigned to <span className="font-semibold">{ticket.assigneeName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {ticket.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
                          <Paperclip size={12} />
                          {ticket.attachments.length}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(ticket.id)
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                        title="Delete request"
                      >
                        <Trash2 size={16} />
                      </button>

                      <ChevronDown
                        size={18}
                        className={`text-white/60 transition-transform ${isExpanded ? 'rotate-180 text-white' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="space-y-6 border-t border-white/10 bg-white/[0.06] p-6">
                    {/* Description */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Description</p>
                      <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm leading-relaxed text-white/80">{ticket.description}</p>
                      </div>
                    </div>

                    {ticket.resolutionNote && (
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">Resolution note</p>
                        <p className="mt-1 text-sm text-emerald-50/80">{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {ticket.rejectionReason && (
                      <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-100">Rejection reason</p>
                        <p className="mt-1 text-sm text-red-50/80">{ticket.rejectionReason}</p>
                      </div>
                    )}

                    {/* Attachments */}
                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-white/70">
                          <ImageIcon size={14} className="text-blue-200" />
                          Attachments ({ticket.attachments.length}/3)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map(a => (
                            <a
                              key={a.id}
                              href={a.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                            >
                              <Paperclip size={12} className="text-blue-200" />
                              <span className="max-w-[240px] truncate">{a.fileName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assign technician */}
                    {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">
                          {ticket.assigneeName ? 'Reassign technician' : 'Assign technician'}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          Enter a technician user ID to assign responsibility.
                        </p>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <input
                            className={inputBase}
                            placeholder="Technician user ID"
                            value={assigneeId}
                            onChange={e => setAssigneeId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAssign(ticket.id)}
                          />
                          <button
                            onClick={() => handleAssign(ticket.id)}
                            disabled={updating || !assigneeId.trim()}
                            className="rounded-2xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6] disabled:opacity-60"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Update status */}
                    {allowedStatuses.length > 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">Update status</p>
                        <p className="mt-1 text-xs text-white/60">
                          Choose the next state. Rejections require a reason; resolutions can include notes.
                        </p>

                        <div className="mt-4 space-y-3">
                          <select
                            className={inputBase}
                            value={statusForm.status}
                            onChange={e => setStatusForm({ status: e.target.value, rejectionReason: '', resolutionNote: '' })}
                          >
                            <option value="" className="bg-slate-900">Select new status…</option>
                            {allowedStatuses.map(s => (
                              <option key={s} value={s} className="bg-slate-900">
                                {s.replace('_', ' ')}
                              </option>
                            ))}
                          </select>

                          {statusForm.status === 'REJECTED' && (
                            <input
                              className={`${inputBase} border-red-300/30 focus:ring-red-400/30 focus:border-red-300/50`}
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.10)' }}
                              placeholder="Rejection reason (required)"
                              value={statusForm.rejectionReason}
                              onChange={e => setStatusForm({ ...statusForm, rejectionReason: e.target.value })}
                            />
                          )}

                          {statusForm.status === 'RESOLVED' && (
                            <textarea
                              className={`${inputBase} min-h-[84px] resize-none`}
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.10)',
                                borderColor: 'rgba(110, 231, 183, 0.20)',
                              }}
                              placeholder="Resolution note (optional)"
                              rows={2}
                              value={statusForm.resolutionNote}
                              onChange={e => setStatusForm({ ...statusForm, resolutionNote: e.target.value })}
                            />
                          )}

                          {statusForm.status && (
                            <button
                              onClick={() => handleStatusUpdate(ticket.id)}
                              disabled={updating}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-[#3b82f6] hover:to-[#60a5fa] disabled:opacity-60"
                            >
                              {updating ? (
                                <>
                                  <Loader size={16} className="animate-spin" />
                                  Updating…
                                </>
                              ) : (
                                <>Set to {statusForm.status.replace('_', ' ')}</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-sm font-semibold text-white/85">Status locked</p>
                        <p className="mt-1 text-xs text-white/60">
                          This request is currently <span className="font-semibold text-white">{ticket.status.replace('_', ' ')}</span>.
                        </p>
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Comments <span className="text-white/50">({ticket.comments?.length || 0})</span>
                      </p>

                      <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-2">
                        {ticket.comments?.length === 0 && (
                          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/60">
                            No comments yet.
                          </div>
                        )}

                        {ticket.comments?.map(c => (
                          <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-white/85">{c.authorName}</p>
                                {c.createdAt && (
                                  <p className="text-[11px] text-white/40">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              {c.authorId === user.userId && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                                    className="text-xs font-semibold text-blue-200 transition hover:text-blue-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-xs font-semibold text-red-200/90 transition hover:text-red-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            {editingComment?.id === c.id ? (
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                  className={inputBase}
                                  value={editingComment.content}
                                  onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                                  onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditComment(c.id)}
                                    className="rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3b82f6]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingComment(null)}
                                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
                                    title="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-white/80">{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <input
                          className={inputBase}
                          placeholder="Add a detailed admin note…"
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(ticket.id)}
                        />
                        <button
                          onClick={() => handleComment(ticket.id)}
                          disabled={!comment.trim()}
                          className="rounded-xl bg-[#2563eb] px-5 py-3 text-white transition hover:bg-[#3b82f6] disabled:opacity-60"
                          title="Send"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(6px)' }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-white/5 px-6 py-5">
              <p className="text-base font-semibold text-white">Delete support request?</p>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                This action can’t be undone. The request, attachments, and comments will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3 px-6 py-5">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTicket(confirmDeleteId)}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminTicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <AdminTicketsContent />
        </div>
      </div>
    </div>
  )
}