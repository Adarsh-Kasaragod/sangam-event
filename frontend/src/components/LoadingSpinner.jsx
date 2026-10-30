/** Centered animated loading spinner */
export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
        gap: '1rem',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span>{text}</span>
    </div>
  )
}
