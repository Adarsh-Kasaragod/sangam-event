import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEvent, createEvent, updateEvent } from '../api/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import '../styles/admin.css'

/** Convert MySQL "2026-11-15 09:00:00" to datetime-local input value "2026-11-15T09:00" */
function toInputDatetime(val) {
  if (!val) return ''
  return val.slice(0, 16).replace(' ', 'T')
}

/** Convert datetime-local "2026-11-15T09:00" to "2026-11-15 09:00:00" for the API */
function fromInputDatetime(val) {
  if (!val) return ''
  return val.replace('T', ' ') + ':00'
}

const EMPTY_FORM = {
  title: '',
  description: '',
  event_date: '',
  venue: '',
  image_url: '',
  capacity: '',
  registration_deadline: '',
}

export default function EventFormPage() {
  const { id }     = useParams()     // present when editing
  const isEdit     = Boolean(id)
  const navigate   = useNavigate()

  const [form, setForm]         = useState(EMPTY_FORM)
  const [loading, setLoading]   = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // Load existing event when editing
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    getEvent(id)
      .then((event) => {
        setForm({
          title:                 event.title,
          description:           event.description,
          event_date:            toInputDatetime(event.event_date),
          venue:                 event.venue,
          image_url:             event.image_url || '',
          capacity:              event.capacity !== null ? String(event.capacity) : '',
          registration_deadline: toInputDatetime(event.registration_deadline),
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors((fe) => ({ ...fe, [e.target.name]: '' }))
  }

  // Client-side validation
  function validate() {
    const errs = {}
    if (!form.title.trim())       errs.title       = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.venue.trim())       errs.venue       = 'Venue is required'
    if (!form.event_date)         errs.event_date  = 'Event date & time is required'

    if (form.capacity !== '' && (isNaN(Number(form.capacity)) || Number(form.capacity) < 1)) {
      errs.capacity = 'Capacity must be a positive number'
    }

    if (form.registration_deadline && form.event_date) {
      if (new Date(form.registration_deadline) >= new Date(form.event_date)) {
        errs.registration_deadline = 'Deadline must be before the event date'
      }
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    const payload = {
      title:                 form.title.trim(),
      description:           form.description.trim(),
      event_date:            fromInputDatetime(form.event_date),
      venue:                 form.venue.trim(),
      image_url:             form.image_url.trim() || null,
      capacity:              form.capacity !== '' ? Number(form.capacity) : null,
      registration_deadline: form.registration_deadline
        ? fromInputDatetime(form.registration_deadline)
        : null,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateEvent(id, payload)
      } else {
        await createEvent(payload)
      }
      navigate('/admin/events')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container event-form-page"><LoadingSpinner text="Loading event…" /></div>

  return (
    <div className="event-form-page">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin/events" className="btn btn-secondary btn-sm">
            ← Back to Events
          </Link>
        </div>

        <div className="event-form-card">
          <h1 style={{ marginBottom: '0.5rem' }}>
            {isEdit ? '✏️ Edit Event' : '➕ Create New Event'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            {isEdit ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="ef-title">Event Title *</label>
              <input
                id="ef-title" name="title" type="text"
                className="form-control"
                placeholder="e.g. Campus Hackathon 2026"
                value={form.title} onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.title)}
                required
              />
              {fieldErrors.title && <span className="field-error" role="alert">{fieldErrors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="ef-desc">Description *</label>
              <textarea
                id="ef-desc" name="description"
                className="form-control"
                placeholder="Describe the event, what attendees can expect, requirements, etc."
                value={form.description} onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.description)}
                required
              />
              {fieldErrors.description && <span className="field-error" role="alert">{fieldErrors.description}</span>}
            </div>

            <div className="event-form-grid">
              {/* Event Date */}
              <div className="form-group">
                <label htmlFor="ef-date">Event Date & Time *</label>
                <input
                  id="ef-date" name="event_date" type="datetime-local"
                  className="form-control"
                  value={form.event_date} onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.event_date)}
                  required
                />
                {fieldErrors.event_date && <span className="field-error" role="alert">{fieldErrors.event_date}</span>}
              </div>

              {/* Venue */}
              <div className="form-group">
                <label htmlFor="ef-venue">Venue *</label>
                <input
                  id="ef-venue" name="venue" type="text"
                  className="form-control"
                  placeholder="e.g. Main Auditorium, Block B"
                  value={form.venue} onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.venue)}
                  required
                />
                {fieldErrors.venue && <span className="field-error" role="alert">{fieldErrors.venue}</span>}
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label htmlFor="ef-capacity">Capacity (optional)</label>
                <input
                  id="ef-capacity" name="capacity" type="number"
                  className="form-control"
                  placeholder="Leave blank for unlimited"
                  min="1" value={form.capacity} onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.capacity)}
                />
                <span className="form-hint">Leave blank for unlimited registrations</span>
                {fieldErrors.capacity && <span className="field-error" role="alert">{fieldErrors.capacity}</span>}
              </div>

              {/* Registration Deadline */}
              <div className="form-group">
                <label htmlFor="ef-deadline">Registration Deadline (optional)</label>
                <input
                  id="ef-deadline" name="registration_deadline" type="datetime-local"
                  className="form-control"
                  value={form.registration_deadline} onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.registration_deadline)}
                />
                <span className="form-hint">Must be before the event date</span>
                {fieldErrors.registration_deadline && (
                  <span className="field-error" role="alert">{fieldErrors.registration_deadline}</span>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label htmlFor="ef-image">Event Image URL (optional)</label>
              <input
                id="ef-image" name="image_url" type="url"
                className="form-control"
                placeholder="https://example.com/event-banner.jpg"
                value={form.image_url} onChange={handleChange}
              />
              <span className="form-hint">Enter a public image URL for the event banner</span>
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  style={{
                    marginTop: '0.5rem',
                    height: '100px',
                    width: '200px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>

            {/* Actions */}
            <div className="event-form-actions">
              <Link to="/admin/events" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting
                  ? (isEdit ? 'Saving…' : 'Creating…')
                  : (isEdit ? '💾 Save Changes' : '✅ Create Event')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
