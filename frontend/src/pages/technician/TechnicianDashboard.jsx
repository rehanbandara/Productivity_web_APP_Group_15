import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { Wrench, Clock, CheckCircle, Bell, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TechnicianTicketsContent } from './TechnicianTicketsPage'
import { getAssignedTickets } from '../../api/tickets'

const ACTIONS = [
  {
    label: 'Assigned Requests',
    desc: 'Review and update your queue',
    href: '/technician/tickets',
    icon: Wrench,
  },
  {
    label: 'Notifications',
    desc: 'New assignments and updates',
    href: '/technician/notifications',
    icon: Bell,
  },
]

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAssignedTickets(user.userId)
        setTickets(res.data)
      } catch {}
    }
    fetch()
  }, [])

  const assigned = tickets.length
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolvedToday = tickets.filter(t => {
    if (t.status !== 'RESOLVED') return false
    return new Date(t.updatedAt).toDateString() === new Date().toDateString()
  }).length

  const firstName = user?.name?.split(' ')?.[0] || 'Technician'

  const STAT_CARDS = [
    {
      label: 'Assigned to me',
      icon: Wrench,
      value: assigned,
      ring: 'ring-blue-300/20',
      iconWrap: 'bg-blue-500/15 text-blue-200',
    },
    {
      label: 'In progress',
      icon: Clock,
      value: inProgress,
      ring: 'ring-amber-300/20',
      iconWrap: 'bg-amber-500/15 text-amber-200',
    },
    {
      label: 'Resolved today',
      icon: CheckCircle,
      value: resolvedToday,
      ring: 'ring-emerald-300/20',
      iconWrap: 'bg-emerald-500/15 text-emerald-200',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111c3a] to-[#1e3a8a] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/75 to-[#1e3a8a]/35" />

          <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/80">
              <ShieldCheck size={14} className="text-blue-200" />
              UNIVERSITY OF MELBOURNE
            </p>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  TECHNICIAN PORTAL :  <span className="text-blue-200">{firstName}</span>
                </h1>
                
              </div>

              
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        {/* Stat Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAT_CARDS.map(({ label, icon: Icon, value, ring, iconWrap }) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl ring-1 ${ring} ${iconWrap}`}>
                <Icon size={18} />
              </div>
              <p className="text-3xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-sm text-white/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ACTIONS.map(({ label, desc, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.14]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/15 blur-2xl opacity-70 transition group-hover:opacity-100" />

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
                <Icon size={20} />
              </div>

              <p className="mt-4 text-base font-semibold text-white">{label}</p>
              <p className="mt-1 text-sm text-white/60">{desc}</p>

              <ArrowRight
                size={18}
                className="absolute bottom-5 right-5 text-white/35 transition group-hover:translate-x-1 group-hover:text-white/70"
              />
            </Link>
          ))}
        </div>

        {/* Assigned Tickets widget */}
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <TechnicianTicketsContent />
        </div>

        
      </div>
    </div>
  )
}