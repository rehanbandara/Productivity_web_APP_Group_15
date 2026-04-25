

export const card = {
  background: 'white',
  border: '1px solid rgba(0,0,0,0.05)',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
}

export const cardGlass = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '16px',
}

export const pageWrap = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
}

export const btnPrimary = {
  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
  color: 'white',
  borderRadius: '12px',
}

export const btnSecondary = {
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.2)',
}

export const btnGhost = {
  background: 'transparent',
  border: '1px solid rgba(0,0,0,0.1)',
  color: '#0f172a',
}


export const STATUS_STYLES = {
  PENDING:   { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  APPROVED:  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  REJECTED:  { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  CANCELLED: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },

  OPEN:        { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  RESOLVED:    { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  CLOSED:      { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
}


export const PRIORITY_STYLES = {
  LOW:      { text: '#16a34a' },
  MEDIUM:   { text: '#d97706' },
  HIGH:     { text: '#ea580c' },
  CRITICAL: { text: '#dc2626' },
}


export const statusBadge = (status) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.CANCELLED
  return {
    background: s.bg,
    color: s.text,
    border: `1px solid ${s.border}`,
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 10px',
  }
}