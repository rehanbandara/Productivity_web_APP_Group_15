import { MapPin, Users, Clock, Box } from 'lucide-react'

const TYPE_META = {
  LECTURE_HALL: { icon: '🏛️', label: 'Lecture Hall' },
  LAB:          { icon: '🔬', label: 'Laboratory' },
  MEETING_ROOM: { icon: '🤝', label: 'Meeting Room' },
  EQUIPMENT:    { icon: '🎥', label: 'Equipment' },
}

export default function ResourceCard({ resource, onClick }) {
  const isActive = resource.status === 'ACTIVE'
  const meta = TYPE_META[resource.type] || { icon: '📦', label: resource.type?.replace('_', ' ') || 'Resource' }

  return (
    <button
      type="button"
      onClick={() => onClick?.(resource)}
      className={[
        'group relative w-full overflow-hidden rounded-3xl border p-5 text-left shadow-2xl shadow-black/10 backdrop-blur-xl transition',
        'bg-white/10',
        isActive ? 'border-white/10 hover:bg-white/[0.14]' : 'border-white/10 opacity-80 hover:opacity-100',
      ].join(' ')}
    >
      {/* subtle corner glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/15 blur-2xl opacity-70 transition group-hover:opacity-100" />

      {/* Status */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span
          className={[
            'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
            isActive
              ? 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100'
              : 'border-red-300/20 bg-red-500/10 text-red-100',
          ].join(' ')}
        >
          {isActive ? 'Active' : 'Out of service'}
        </span>
      </div>

      {/* Icon */}
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20 transition group-hover:bg-blue-500/20">
        <span className="text-[22px]" aria-hidden="true">{meta.icon}</span>
      </div>

      {/* Name */}
      <p className="mt-4 pr-20 text-sm font-semibold text-white">
        {resource.name}
      </p>
      <p className="mt-1 text-xs text-white/50">
        {resource.resourceCode}
      </p>

      {/* Type badge */}
      <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
        <Box size={13} className="text-blue-200" />
        {meta.label}
      </span>

      {/* Details */}
      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        {resource.location && (
          <p className="flex items-center gap-2 text-xs text-white/60">
            <MapPin size={14} className="text-blue-200/90" />
            <span className="truncate">{resource.location}</span>
          </p>
        )}

        {resource.capacity && (
          <p className="flex items-center gap-2 text-xs text-white/60">
            <Users size={14} className="text-blue-200/90" />
            {resource.capacity} capacity
          </p>
        )}

        {resource.availabilityStart && resource.availabilityEnd && (
          <p className="flex items-center gap-2 text-xs text-white/60">
            <Clock size={14} className="text-blue-200/90" />
            {String(resource.availabilityStart).substring(0, 5)} – {String(resource.availabilityEnd).substring(0, 5)}
          </p>
        )}
      </div>
    </button>
  )
}