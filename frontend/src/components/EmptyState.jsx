/** Empty state component with emoji icon and descriptive message */
export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1.5rem',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.15rem',
          marginBottom: '0.5rem',
          color: 'var(--color-text)',
        }}
      >
        {title}
      </h3>
      {message && (
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
            maxWidth: '360px',
            margin: '0 auto 1.5rem',
          }}
        >
          {message}
        </p>
      )}
      {action && action}
    </div>
  )
}
