import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
  getMyTickets, createTicket, deleteTicket,
  addComment, editComment, deleteComment,
  addAttachment, deleteAttachment,
} from '../../api/tickets'
import {
  Wrench,
  Plus,
  ChevronDown,
  Send,
  Paperclip,
  X,
  Trash2,
  ShieldCheck,
  Info,
  MapPin,
  Flag,
  Image as ImageIcon,
  Loader,
} from 'lucide-react'
import toast from 'react-hot-toast'

const TECH_IMG = '/src/assets/tech.jpg'

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'IT_HARDWARE', 'IT_SOFTWARE',
  'HVAC', 'FURNITURE', 'SECURITY', 'CLEANING', 'OTHER',
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const DELETABLE_STATUSES = ['OPEN']

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

const EMPTY_FORM = {
  title: '', description: '', location: '',
  category: 'IT_HARDWARE', priority: 'MEDIUM', contactDetails: '',
}
const EMPTY_ERRORS = { title: '', description: '', location: '', contactDetails: '' }

const TITLE_MAX       = 100
const DESCRIPTION_MAX = 1000
const LOCATION_MAX    = 100
const CONTACT_MAX     = 200
const COMMENT_MAX     = 500

function validateForm(form) {
  const errors = { ...EMPTY_ERRORS }
  let valid = true

  const title = form.title.trim()
  if (!title) { errors.title = 'Title is required.'; valid = false }
  else if (title.length < 5) { errors.title = 'Title must be at least 5 characters.'; valid = false }
  else if (title.length > TITLE_MAX) { errors.title = `Max ${TITLE_MAX} characters.`; valid = false }

  const description = form.description.trim()
  if (!description) { errors.description = 'Description is required.'; valid = false }
  else if (description.length < 10) { errors.description = 'At least 10 characters required.'; valid = false }
  else if (description.length > DESCRIPTION_MAX) { errors.description = `Max ${DESCRIPTION_MAX} characters.`; valid = false }

  const location = form.location.trim()
  if (!location) { errors.location = 'Location is required.'; valid = false }
  else if (location.length > LOCATION_MAX) { errors.location = `Max ${LOCATION_MAX} characters.`; valid = false }

  const contact = form.contactDetails.trim()
  if (contact.length > CONTACT_MAX) { errors.contactDetails = `Max ${CONTACT_MAX} characters.`; valid = false }

  return { errors, valid }
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-200">{msg}</p>
}

function CharCount({ current, max }) {
  const near = current > max * 0.85
  const over = current > max
  return (
    <span className={`ml-auto text-xs ${over ? 'text-red-200' : near ? 'text-amber-200' : 'text-white/45'}`}>
      {current}/{max}
    </span>
  )
}

function DeleteConfirmDialog({ ticket, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-white/10 bg-white/5 px-6 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500/15 text-red-200 ring-1 ring-red-300/20">
            <Trash2 size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">Delete support request?</h3>
            <p className="mt-1 text-xs text-white/60">
              You’re about to delete: <span className="font-semibold text-white/85">“{ticket.title}”</span>
            </p>
            <p className="mt-1 text-xs text-white/50">This action can’t be undone.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-50"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MyTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]                   = useState([])
  const [loading, setLoading]                   = useState(true)
  const [showForm, setShowForm]                 = useState(false)
  const [form, setForm]                         = useState(EMPTY_FORM)
  const [errors, setErrors]                     = useState(EMPTY_ERRORS)
  const [touched, setTouched]                   = useState({})
  const [submitting, setSubmitting]             = useState(false)
  const [attachmentFiles, setAttachmentFiles]   = useState([])
  const [selectedTicket, setSelectedTicket]     = useState(null)
  const [comment, setComment]                   = useState('')
  const [commentError, setCommentError]         = useState('')
  const [editingComment, setEditingComment]     = useState(null)
  const [editCommentError, setEditCommentError] = useState('')
  const [deleteTarget, setDeleteTarget]         = useState(null)
  const [deleting, setDeleting]                 = useState(false)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await getMyTickets(user.userId)
      setTickets(res.data)
    } catch {
      toast.error('Failed to load support requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  const handleDeleteTicket = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await deleteTicket(deleteTarget.id, user.userId)
      toast.success('Support request deleted')
      if (selectedTicket?.id === deleteTarget.id) setSelectedTicket(null)
      setDeleteTarget(null)
      fetchTickets()
    } catch {
      toast.error('Failed to delete support request')
    } finally {
      setDeleting(false)
    }
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (touched[field]) {
      const { errors: newErrors } = validateForm(updated)
      setErrors(prev => ({ ...prev, [field]: newErrors[field] }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const { errors: newErrors } = validateForm(form)
    setErrors(prev => ({ ...prev, [field]: newErrors[field] }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setTouched({ title: true, description: true, location: true, contactDetails: true })
    const { errors: validationErrors, valid } = validateForm(form)
    setErrors(validationErrors)
    if (!valid) return

    try {
      setSubmitting(true)
      const res = await createTicket({ ...form, reporterId: user.userId })
      const newTicketId = res.data.id
      for (const file of attachmentFiles) { await addAttachment(newTicketId, file) }
      toast.success('Support request submitted')
      setShowForm(false)
      setForm(EMPTY_FORM)
      setErrors(EMPTY_ERRORS)
      setTouched({})
      setAttachmentFiles([])
      fetchTickets()
    } catch {
      toast.error('Failed to submit support request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setForm(EMPTY_FORM)
    setErrors(EMPTY_ERRORS)
    setTouched({})
    setAttachmentFiles([])
  }

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files)
    if (picked.some(f => !f.type.startsWith('image/'))) {
      toast.error('Only image files are allowed.')
      e.target.value = ''
      return
    }
    if (picked.some(f => f.size > 5 * 1024 * 1024)) {
      toast.error('Each image must be 5 MB or smaller.')
      e.target.value = ''
      return
    }
    setAttachmentFiles(prev => [...prev, ...picked].slice(0, 3))
    e.target.value = ''
  }

  const handleDeleteAttachment = async (id) => {
    try {
      await deleteAttachment(id, user.userId)
      toast.success('Attachment removed')
      fetchTickets()
    } catch {
      toast.error('Failed to remove attachment')
    }
  }

  const validateComment = (v) => {
    if (!v.trim()) return 'Comment cannot be empty.'
    if (v.trim().length > COMMENT_MAX) return `Max ${COMMENT_MAX} characters.`
    return ''
  }

  const handleComment = async () => {
    const err = validateComment(comment)
    if (err) { setCommentError(err); return }
    if (!selectedTicket) return
    try {
      await addComment(selectedTicket.id, { content: comment, authorId: user.userId })
      toast.success('Comment added')
      setComment('')
      setCommentError('')
      fetchTickets()
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleEditComment = async (commentId) => {
    const err = validateComment(editingComment?.content ?? '')
    if (err) { setEditCommentError(err); return }
    try {
      await editComment(commentId, { content: editingComment.content, authorId: user.userId })
      toast.success('Comment updated')
      setEditingComment(null)
      setEditCommentError('')
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

  const inputClass = (field) => (
    `w-full rounded-xl px-4 py-3 text-sm outline-none transition
     bg-white/10 text-white placeholder:text-white/40
     border ${errors[field] ? 'border-red-300/50' : 'border-white/15'}
     focus:ring-2 ${errors[field] ? 'focus:ring-red-400/30' : 'focus:ring-blue-400/30'}
     focus:border ${errors[field] ? 'focus:border-red-300/60' : 'focus:border-blue-300/40'}`
  )

  const selectClass =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition ' +
    'bg-white/10 text-white border border-white/15 focus:border-blue-300/40 focus:ring-2 focus:ring-blue-400/30'

  return (
    <div className="space-y-5">
      {deleteTarget && (
        <DeleteConfirmDialog
          ticket={deleteTarget}
          onConfirm={handleDeleteTicket}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Wrench size={18} className="text-blue-200" /> Support Requests
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Report campus issues and track progress from one dashboard.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#3b82f6]"
        >
          <Plus size={16} />
          New request
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <Wrench size={18} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Create a support request</p>
                <p className="text-xs text-white/60">Add clear details to speed up resolution.</p>
              </div>
            </div>

            <button
              onClick={handleCancelForm}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate} noValidate className="px-6 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wide text-white/80">
                    Title <span className="text-blue-200">*</span>
                  </label>
                  <CharCount current={form.title.length} max={TITLE_MAX} />
                </div>
                <input
                  className={inputClass('title')}
                  placeholder="e.g., Projector not working in Lecture Theatre 3"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  onBlur={() => handleBlur('title')}
                />
                <FieldError msg={errors.title} />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wide text-white/80">
                    Description <span className="text-blue-200">*</span>
                  </label>
                  <CharCount current={form.description.length} max={DESCRIPTION_MAX} />
                </div>
                <textarea
                  className={`${inputClass('description')} min-h-[96px] resize-none`}
                  placeholder="What happened, when did it start, and what have you tried?"
                  rows={3}
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                />
                <FieldError msg={errors.description} />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wide text-white/80">
                    Location <span className="text-blue-200">*</span>
                  </label>
                  <CharCount current={form.location.length} max={LOCATION_MAX} />
                </div>
                <input
                  className={inputClass('location')}
                  placeholder="e.g., Building, level, room number"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  onBlur={() => handleBlur('location')}
                />
                <FieldError msg={errors.location} />
              </div>

              {/* Category & Priority */}
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Category</label>
                <select
                  className={selectClass}
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-white/80">Priority</label>
                <select
                  className={selectClass}
                  value={form.priority}
                  onChange={e => handleChange('priority', e.target.value)}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p} className="bg-slate-900">{p}</option>
                  ))}
                </select>
              </div>

              {/* Contact */}
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wide text-white/80">
                    Contact details <span className="text-white/50">(optional)</span>
                  </label>
                  <CharCount current={form.contactDetails.length} max={CONTACT_MAX} />
                </div>
                <input
                  className={inputClass('contactDetails')}
                  placeholder="e.g., phone extension, email, or preferred contact method"
                  value={form.contactDetails}
                  onChange={e => handleChange('contactDetails', e.target.value)}
                  onBlur={() => handleBlur('contactDetails')}
                />
                <FieldError msg={errors.contactDetails} />
              </div>

              {/* Attachments */}
              <div className="md:col-span-2">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold tracking-wide text-white/80">
                    Attachments <span className="text-white/50">— up to 3 images (max 5 MB each)</span>
                  </p>
                  {attachmentFiles.length > 0 && (
                    <span className="rounded-full border border-blue-300/25 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
                      {attachmentFiles.length}/3 selected
                    </span>
                  )}
                </div>

                {attachmentFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachmentFiles.map((f, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/15"
                        />
                        <button
                          type="button"
                          onClick={() => setAttachmentFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-red-200 transition hover:bg-black/70"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {attachmentFiles.length < 3 && (
                  <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                    <Paperclip size={16} className="text-blue-200" />
                    Add images
                    <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-white/50">
                      <ImageIcon size={14} />
                      PNG/JPG
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="md:col-span-2">
                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-[#3b82f6] hover:to-[#60a5fa] disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit request
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  <Info size={16} className="mt-0.5 text-blue-200" />
                  Include building + room number and any error messages for faster handling.
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-transparent" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-sm font-semibold text-white/90">No support requests yet</p>
          <p className="mt-2 text-xs text-white/60">
            Create a request to report IT, facilities, or campus maintenance issues.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const isOpen = selectedTicket?.id === ticket.id
            const statusClass = STATUS_COLORS[ticket.status] || 'bg-white/10 text-white/80 border border-white/10'
            const priorityClass = PRIORITY_COLORS[ticket.priority] || 'bg-white/10 text-white/80 border border-white/10'

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
                  setCommentError('')
                  setEditingComment(null)
                  setEditCommentError('')
                }}
              >
                <div className="flex items-start justify-between gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">{ticket.title}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass}`}>
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
                      {ticket.assigneeName && (
                        <span className="inline-flex items-center gap-1.5">
                          <Wrench size={14} className="text-blue-200/90" />
                          Assigned to {ticket.assigneeName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {DELETABLE_STATUSES.includes(ticket.status) && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(ticket) }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                        title="Delete request"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <ChevronDown
                      size={18}
                      className={`mt-0.5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="space-y-4 border-t border-white/10 px-5 pb-5"
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="pt-4 text-sm text-white/80">{ticket.description}</p>

                    {ticket.resolutionNote && (
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
                        <p className="text-xs font-semibold text-emerald-100">Resolution note</p>
                        <p className="mt-1 text-sm text-emerald-50/80">{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {ticket.rejectionReason && (
                      <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4">
                        <p className="text-xs font-semibold text-red-100">Update from staff</p>
                        <p className="mt-1 text-sm text-red-50/80">{ticket.rejectionReason}</p>
                      </div>
                    )}

                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-white/70">
                          Attachments ({ticket.attachments.length}/3)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map(a => (
                            <div key={a.id} className="relative">
                              <img
                                src={a.fileUrl}
                                alt={a.fileName}
                                className="h-20 w-20 cursor-pointer rounded-2xl object-cover ring-1 ring-white/15 transition hover:scale-[1.03]"
                                onClick={() => window.open(a.fileUrl, '_blank')}
                              />
                              {ticket.status === 'OPEN' && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleDeleteAttachment(a.id) }}
                                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-red-200 transition hover:bg-black/70"
                                  title="Remove attachment"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="mb-2 text-xs font-semibold text-white/70">
                        Comments ({ticket.comments?.length || 0})
                      </p>

                      <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                        {ticket.comments?.map(c => (
                          <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <p className="truncate text-xs font-semibold text-white/85">{c.authorName}</p>
                              {c.authorId === user.userId && (
                                <div className="flex shrink-0 gap-3">
                                  <button
                                    onClick={() => { setEditingComment({ id: c.id, content: c.content }); setEditCommentError('') }}
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
                              <div className="mt-1 space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    className={[
                                      'flex-1 rounded-xl px-3 py-2 text-sm outline-none',
                                      'bg-white/10 text-white placeholder:text-white/40',
                                      'border',
                                      editCommentError ? 'border-red-300/40' : 'border-blue-300/25',
                                      'focus:ring-2 focus:ring-blue-400/30',
                                    ].join(' ')}
                                    value={editingComment.content}
                                    onChange={e => {
                                      setEditingComment({ ...editingComment, content: e.target.value })
                                      if (editCommentError) setEditCommentError(validateComment(e.target.value))
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                  />
                                  <button
                                    onClick={() => handleEditComment(c.id)}
                                    className="rounded-xl bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3b82f6]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingComment(null); setEditCommentError('') }}
                                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                    title="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                <FieldError msg={editCommentError} />
                              </div>
                            ) : (
                              <p className="text-sm text-white/80">{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add comment */}
                      <div className="mt-3">
                        <div className="mb-2 flex items-center justify-between">
                          {commentError ? (
                            <span className="text-xs text-red-200">{commentError}</span>
                          ) : (
                            <span />
                          )}
                          <CharCount current={comment.length} max={COMMENT_MAX} />
                        </div>

                        <div className="flex gap-2">
                          <input
                            className={[
                              'flex-1 rounded-xl px-3 py-2 text-sm outline-none transition',
                              'bg-white/10 text-white placeholder:text-white/40',
                              'border',
                              commentError ? 'border-red-300/40' : 'border-white/15',
                              'focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/40',
                            ].join(' ')}
                            placeholder="Add a comment…"
                            value={comment}
                            onChange={e => {
                              setComment(e.target.value)
                              if (commentError) setCommentError(validateComment(e.target.value))
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                          />
                          <button
                            onClick={handleComment}
                            className="rounded-xl bg-[#2563eb] px-3 py-2 text-white transition hover:bg-[#3b82f6]"
                            title="Send"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {DELETABLE_STATUSES.includes(ticket.status) && (
                      <div className="pt-2">
                        <button
                          onClick={() => setDeleteTarget(ticket)}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-red-200/90 transition hover:text-red-100"
                        >
                          <Trash2 size={14} />
                          Delete this request
                        </button>
                      </div>
                    )}
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

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative h-[280px]">
          <img
            src={TECH_IMG}
            alt="Support and maintenance"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'center 40%', filter: 'brightness(0.55)' }}
            onError={e => (e.target.style.display = 'none')}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/70 to-[#1e3a8a]/35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_55%)]" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
                  <ShieldCheck size={14} className="text-blue-200" />
                  UNIVERSITY OF MELBOURNE • SUPPORT
                </p>

                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                  Support Requests
                </h1>

                <p className="mt-2 text-sm text-white/70 md:text-[15px]">
                  Report and track maintenance and IT issues across campus — with comments and attachments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <MyTicketsContent />
        </div>
      </div>
    </div>
  )
}