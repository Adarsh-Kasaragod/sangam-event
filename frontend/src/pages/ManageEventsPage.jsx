import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEvents, deleteEvent } from '../api/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Modal from '../components/Modal.jsx'
import '../styles/admin.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ManageEventsPage() {
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // event to confirm delete
  const [deleting, setDeleting]   = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  function fetchEvents() {
    setLoading(true)
    getEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteEvent(deleteTarget.id)
      setEvents((ev) => ev.filter((e) => e.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="manage-toolbar">
          <div className="admin-header" style={{ margin: 0 }}>
            <h1>Manage Events</h1>
            <p>Create, edit, and delete college events</p>
          </div>
          <Link to="/admin/events/new" className="btn btn-primary">
            ＋ New Event
          </Link>
        </div>

        {deleteError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            ❌ {deleteError}
          </div>
        )}

        {loading && <LoadingSpinner text="Loading events…" />}

        {!loading && error && (
          <div className="alert alert-error">❌ {error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon="🗓"
            title="No events yet"
            message="Create your first event to get started."
            action={
              <Link to="/admin/events/new" className="btn btn-primary">
                ＋ Create Event
              </Link>
            }
          />
        )}

        {!loading && !error && events.length > 0 && (
          <div className="table-wrapper">
            <table aria-label="Events list">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th className="hide-mobile">Date</th>
                  <th className="hide-mobile">Venue</th>
                  <th>Status</th>
                  <th className="hide-mobile">Regs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => (
                  <tr key={event.id}>
                    <td style={{ color: 'var(--color-text-subtle)', width: '40px' }}>
                      {i + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {event.title}
                      </div>
                      {/* Mobile fallback — show date under title */}
                      <div
                        style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '2px' }}
                        className="hide-desktop"
                      >
                        {formatDate(event.event_date)}
                      </div>
                    </td>
                    <td className="hide-mobile" style={{ whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                      {formatDate(event.event_date)}
                    </td>
                    <td className="hide-mobile" style={{ color: 'var(--color-text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.venue}
                    </td>
                    <td>
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      {event.capacity !== null
                        ? `${event.registration_count}/${event.capacity}`
                        : event.registration_count}
                    </td>
                    <td>
                      <div className="event-actions">
                        <Link
                          to={`/admin/events/edit/${event.id}`}
                          className="btn btn-secondary btn-sm"
                          aria-label={`Edit ${event.title}`}
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(event)}
                          aria-label={`Delete ${event.title}`}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete Event"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? All ${deleteTarget.registration_count} registration(s) will also be permanently deleted (CASCADE).`
            : ''
        }
        confirmLabel="Yes, Delete"
        confirmClass="btn-danger"
        loading={deleting}
      />
    </div>
  )
}
