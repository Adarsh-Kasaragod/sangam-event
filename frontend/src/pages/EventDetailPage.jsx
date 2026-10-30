import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvent, registerForEvent } from '../api/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import '../styles/eventdetail.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="event-detail__meta-item">
      <div className="event-detail__meta-icon">{icon}</div>
      <div>
        <div className="event-detail__meta-label">{label}</div>
        <div className="event-detail__meta-value">{value}</div>
      </div>
    </div>
  )
}

const INITIAL_FORM   = { name: '', email: '', phone: '' }
const INITIAL_ERRORS = { name: '', email: '', phone: '' }

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [form, setForm]               = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState(INITIAL_ERRORS)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess]         = useState(false)

  useEffect(() => {
    setLoading(true)
    getEvent(id)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function validate() {
    const errs = { name: '', email: '', phone: '' }
    let valid = true

    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters'
      valid = false
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address'
      valid = false
    }
    // Strips common formatting chars before checking 10-digit requirement
    if (!/^\d{10}$/.test(form.phone.replace(/[\s\-\(\)\+]/g, ''))) {
      errs.phone = 'Phone number must be exactly 10 digits'
      valid = false
    }

    setFieldErrors(errs)
    return valid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await registerForEvent({ event_id: Number(id), ...form })
      setSuccess(true)
      setForm(INITIAL_FORM)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors((fe) => ({ ...fe, [e.target.name]: '' }))
  }

  if (loading) return <div className="container"><LoadingSpinner text="Loading event…" /></div>

  if (error)
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="alert alert-error">❌ {error}</div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          ← Back to Events
        </Link>
      </div>
    )

  if (!event) return null

  const canRegister = event.status === 'Upcoming'

  const capacityText =
    event.capacity !== null
      ? `${event.registration_count} / ${event.capacity} spots filled`
      : `${event.registration_count} registered`

  return (
    <div className="event-detail-page">
      <div className="container">
        <Link to="/" className="event-detail__back">
          ← Back to Events
        </Link>

        <div className="event-detail__hero">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} />
          ) : (
            <div className="event-detail__hero-placeholder">🎪</div>
          )}
          <div className="event-detail__hero-overlay" />
          <div className="event-detail__hero-badge">
            <StatusBadge status={event.status} />
          </div>
        </div>

        <div className="event-detail__layout">
          <div className="event-detail__info">
            <h1 className="event-detail__title">{event.title}</h1>

            <div className="event-detail__meta-grid">
              <MetaItem icon="📅" label="Date & Time" value={formatDate(event.event_date)} />
              <MetaItem icon="📍" label="Venue" value={event.venue} />
              <MetaItem icon="👥" label="Registrations" value={capacityText} />
              {event.registration_deadline && (
                <MetaItem
                  icon="⏰"
                  label="Deadline"
                  value={formatDate(event.registration_deadline)}
                />
              )}
            </div>

            <p className="event-detail__description-title">About this event</p>
            <p className="event-detail__description">{event.description}</p>
          </div>

          <div className="event-detail__form-card">
            <h2 className="event-detail__form-title">
              {canRegister ? '✍️ Register for this Event' : '📋 Event Details'}
            </h2>

            {success && (
              <div className="event-detail__success">
                <div className="event-detail__success-icon">🎉</div>
                <h3 style={{ marginBottom: '0.5rem' }}>You're registered!</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  We look forward to seeing you at <strong>{event.title}</strong>.
                </p>
                <button className="btn btn-ghost" onClick={() => setSuccess(false)}>
                  Register another
                </button>
              </div>
            )}

            {!success && !canRegister && (
              <div className="event-detail__closed-msg">
                <div className="event-detail__closed-icon">
                  {event.status === 'Past' ? '🕐' : '🔒'}
                </div>
                <h3>Registration {event.status === 'Past' ? 'Ended' : 'Closed'}</h3>
                <p>
                  {event.status === 'Past'
                    ? 'This event has already taken place.'
                    : 'Registration is no longer available for this event.'}
                </p>
              </div>
            )}

            {!success && canRegister && (
              <form onSubmit={handleSubmit} noValidate>
                {submitError && (
                  <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                    ❌ {submitError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="reg-name">Full Name *</label>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    aria-invalid={Boolean(fieldErrors.name)}
                    required
                  />
                  {fieldErrors.name && (
                    <span id="name-error" className="field-error" role="alert">
                      {fieldErrors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address *</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="e.g. priya@college.edu"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  {fieldErrors.email && (
                    <span id="email-error" className="field-error" role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-phone">Contact Number *</label>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength={10}
                    inputMode="numeric"
                    aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    required
                  />
                  <span id="phone-hint" className="form-hint">Enter 10-digit number without country code</span>
                  {fieldErrors.phone && (
                    <span id="phone-error" className="field-error" role="alert">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? 'Registering…' : '🎟 Confirm Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
