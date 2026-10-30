import { useEffect } from 'react'

/**
 * Modal — accessible confirmation dialog.
 * Props:
 *  isOpen, onClose, onConfirm, title, message,
 *  confirmLabel (default 'Confirm'), confirmClass (default 'btn-danger'), loading
 */
export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmClass = 'btn-danger',
  loading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          maxWidth: '420px',
          width: '100%',
          boxShadow: 'var(--shadow-elevated)',
          animation: 'fadeIn 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
          ⚠️
        </div>
        <h2
          id="modal-title"
          style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textAlign: 'center', marginBottom: '0.75rem' }}
        >
          {title}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${confirmClass}`}
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
