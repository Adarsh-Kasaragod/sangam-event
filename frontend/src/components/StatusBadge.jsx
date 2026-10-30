/**
 * StatusBadge — color-coded pill for event status.
 * status: 'Upcoming' | 'Past' | 'Registration Closed'
 */
export default function StatusBadge({ status }) {
  const config = {
    Upcoming: {
      label: '🟢 Upcoming',
      style: {
        background: 'rgba(16,185,129,0.12)',
        color: '#10b981',
        border: '1px solid rgba(16,185,129,0.3)',
      },
    },
    Past: {
      label: '⬛ Past',
      style: {
        background: 'rgba(107,114,128,0.12)',
        color: '#9ca3af',
        border: '1px solid rgba(107,114,128,0.3)',
      },
    },
    'Registration Closed': {
      label: '🔒 Closed',
      style: {
        background: 'rgba(245,158,11,0.12)',
        color: '#f59e0b',
        border: '1px solid rgba(245,158,11,0.3)',
      },
    },
  }

  const c = config[status] ?? config['Past']

  return (
    <span
      style={{
        ...c.style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
      aria-label={`Event status: ${status}`}
    >
      {c.label}
    </span>
  )
}
