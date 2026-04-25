import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { getAssignedTickets, updateTicketStatus, addComment, editComment, deleteComment } from '../../api/tickets'
import {
  Wrench,
  ChevronDown,
  Send,
  X,
  ShieldCheck,
  MapPin,
  Flag,
  User,
  Image as ImageIcon,
  Loader,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  OPEN:        ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
}

const STATUS_COLORS = {
  OPEN:        'bg-blue-400/15 text-blue-200 border border-blue-300/20',
  IN_PROGRESS: 'bg-amber-400/15 text-amber-200 border border-amber-300/20',
  RESOLVED:    'bg-emerald-400/15 text-emerald-200 border border-emerald-300/20',
  CLOSED:      'bg-slate-400/15 text-slate-200 border border-slate-300/20',
  REJECTED:    'bg-red-400/15 text-red-200 border border-red-300/20',
}

const PRIORITY_COLORS = {
  LOW:      'text-emerald-200 bg-emerald-400/15 border border-emerald-300/20',
  MEDIUM:   'text-amber-200 bg-amber-400/15 border border-amber-300/20',
  HIGH:     'text-orange-200 bg-orange-400/15 border border-orange-300/20',
  CRITICAL: 'text-red-200 bg-red-400/15 border border-red-300/20',
}


export function TechnicianTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comment, setComment]               = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [statusForm, setStatusForm]         = useState({ status: '', resolutionNote: '' })
  const [updating, setUpdating]             = useState(false)

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await getAssignedTickets(user.userId)
      setTickets(res.data)
    } catch {
      toast.error('Failed to load assigned tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id)
      if (updated) setSelectedTicket(updated)
    }
  }, [tickets])

  const handleStatusUpdate = async (ticketId) => {
    if (!statusForm.status) return
    try {
      setUpdating(true)
      await updateTicketStatus(ticketId, {
        status: statusForm.status,
        resolutionNote: statusForm.resolutionNote || null,
        updatedByUserId: user.userId,
      })
      toast.success('Status updated')
      setStatusForm({ status: '', resolutionNote: '' })
      fetchTickets()
    } catch {
      toast.error('Failed to update status')
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

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white placeholder:text-white/40 ' +
    'border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Wrench size={18} className="text-blue-200" />
            Assigned Support Requests
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Review details, update status, and communicate with requesters.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <Info size={14} className="text-blue-200" />
          Updates follow the flow: Open → In progress → Resolved → Closed.
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-transparent" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-12 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-sm font-semibold text-white/90">No assigned requests</p>
          <p className="mt-2 text-xs text-white/60">
            When you’re assigned a ticket, it will appear here with full context and attachments.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const allowedStatuses = STATUS_FLOW[ticket.status] || []
            const isOpen = selectedTicket?.id === ticket.id

            return (
              <div
                key={ticket.id}
                className={[
                  'cursor-pointer overflow-hidden rounded-3xl border bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-xl transition',
                  isOpen ? 'border-blue-300/25' : 'border-white/10 hover:bg-white/[0.14]',
                ].join(' ')}
                onClick={() => {
                  setSelectedTicket(isOpen ? null : ticket)
                  setComment('')
                  setEditingComment(null)
                  setStatusForm({ status: '', resolutionNote: '' })
                }}
              >
                {/* Summary row */}
                <div className="flex items-start justify-between gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">
                        {ticket.title}
                      </span>

                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>

                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-200/90" />
                        {ticket.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Flag size={14} className="text-blue-200/90" />
                        {ticket.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User size={14} className="text-blue-200/90" />
                        Reported by {ticket.reporterName}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`mt-0.5 shrink-0 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Expanded panel */}
                {isOpen && (
                  <div
                    className="space-y-5 border-t border-white/10 px-5 pb-5"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Description</p>
                      <p className="mt-2 text-sm text-white/80">{ticket.description}</p>
                    </div>

                    {/* Attachments */}
                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-white/70">
                          <ImageIcon size={14} className="text-blue-200" />
                          Attachments ({ticket.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map(a => (
                            <img
                              key={a.id}
                              src={a.fileUrl}
                              alt={a.fileName}
                              className="h-24 w-24 cursor-pointer rounded-2xl object-cover ring-1 ring-white/15 transition hover:scale-[1.03]"
                              onClick={() => window.open(a.fileUrl, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolution Note */}
                    {ticket.resolutionNote && (
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                        <p className="text-xs font-semibold text-emerald-100">Resolution note</p>
                        <p className="mt-1 text-sm text-emerald-50/80">{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {/* Update Status */}
                    {allowedStatuses.length > 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">Update status</p>
                        <p className="mt-1 text-xs text-white/60">
                          Choose the next stage for this request. Add a resolution note when resolving.
                        </p>

                        <div className="mt-4 space-y-3">
                          <select
                            className={inputBase}
                            value={statusForm.status}
                            onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                          >
                            <option value="" className="bg-slate-900">Select status…</option>
                            {allowedStatuses.map(s => (
                              <option key={s} value={s} className="bg-slate-900">
                                {s.replace('_', ' ')}
                              </option>
                            ))}
                          </select>

                          {statusForm.status === 'RESOLVED' && (
                            <textarea
                              className={`${inputBase} min-h-[84px] resize-none`}
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.10)',
                                borderColor: 'rgba(110, 231, 183, 0.20)',
                              }}
                              placeholder="Resolution note (optional) — include steps taken and outcome"
                              rows={2}
                              value={statusForm.resolutionNote}
                              onChange={e => setStatusForm({ ...statusForm, resolutionNote: e.target.value })}
                            />
                          )}

                          {statusForm.status && (
                            <button
                              onClick={() => handleStatusUpdate(ticket.id)}
                              disabled={updating}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-[#3b82f6] hover:to-[#60a5fa] disabled:opacity-60"
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
                        <p className="text-sm font-semibold text-white/85">No further status changes</p>
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

                      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                        {ticket.comments?.length === 0 && (
                          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/60">
                            No comments yet.
                          </div>
                        )}

                        {ticket.comments?.map(c => (
                          <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <p className="truncate text-xs font-semibold text-white/85">{c.authorName}</p>

                              {c.authorId === user.userId && (
                                <div className="flex shrink-0 gap-3">
                                  <button
                                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                                    className="text-xs font-semibold text-white/60 transition hover:text-white"
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
                              <div className="mt-2 flex gap-2">
                                <input
                                  className={inputBase}
                                  value={editingComment.content}
                                  onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                                  onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                />
                                <button
                                  onClick={() => handleEditComment(c.id)}
                                  className="rounded-xl bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3b82f6]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingComment(null)}
                                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-white/80">{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add comment */}
                      <div className="mt-3 flex gap-2">
                        <input
                          className={inputBase}
                          placeholder="Add an update for the requester…"
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(ticket.id)}
                        />
                        <button
                          onClick={() => handleComment(ticket.id)}
                          disabled={!comment.trim()}
                          className="rounded-xl bg-[#2563eb] px-3 py-3 text-white transition hover:bg-[#3b82f6] disabled:opacity-60"
                          title="Send"
                        >
                          <Send size={16} />
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
    </div>
  )
}


export default function TechnicianTicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative h-[240px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/75 to-[#1e3a8a]/35" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
                <ShieldCheck size={14} className="text-blue-200" />
                UNIVERSITY OF MELBOURNE
              </p>

              <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                Assigned Support Requests
              </h1>

              <p className="mt-2 text-sm text-white/70 md:text-[15px]">
                Manage status updates, add resolution notes, and keep requesters informed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <TechnicianTicketsContent />
        </div>
      </div>
    </div>
  )
}