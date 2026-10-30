import { useState, useEffect, useCallback } from 'react'
import { getEvents, getRegistrations } from '../api/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/admin.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function RegistrationsPage() {
  const [events, setEvents]           = useState([])
  const [selectedId, setSelectedId]   = useState('')
  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [data, setData]               = useState(null)   // { event, total_count, filtered_count, registrations }
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [error, setError]             = useState(null)

  // Load event list for selector
  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingEvents(false))
  }, [])

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Fetch registrations when event or search changes
  useEffect(() => {
    if (!selectedId) { setData(null); return }
    setLoadingRegs(true)
    setError(null)
    getRegistrations(selectedId, debouncedSearch)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingRegs(false))
  }, [selectedId, debouncedSearch])

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Registration Management</h1>
          <p>Select an event to view and search its registrations</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>❌ {error}</div>}

        {/* Controls */}
        <div className="reg-controls">
          {/* Event selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '260px' }}>
            <label htmlFor="event-select" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
              Select Event
            </label>
            <select
              id="event-select"
              className="form-control"
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setSearch(''); setData(null) }}
              disabled={loadingEvents}
            >
              <option value="">
                {loadingEvents ? 'Loading events…' : '— Choose an event —'}
              </option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.registration_count} registered)
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
            <label htmlFor="reg-search" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
              Search Registrants
            </label>
            <input
              id="reg-search"
              type="search"
              className="form-control"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!selectedId}
              aria-label="Search registrations by name or email"
            />
          </div>

          {/* Count badge */}
          {data && (
            <div style={{ alignSelf: 'flex-end' }}>
              <span className="reg-count-badge">
                📋 {data.total_count} total
                {debouncedSearch && ` · ${data.filtered_count} matched`}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        {!selectedId && !loadingEvents && (
          <EmptyState
            icon="🔍"
            title="Select an event"
            message="Choose an event from the dropdown above to view its registrations."
          />
        )}

        {loadingRegs && <LoadingSpinner text="Loading registrations…" />}

        {!loadingRegs && data && data.registrations.length === 0 && (
          <EmptyState
            icon="📭"
            title="No registrations found"
            message={
              debouncedSearch
                ? `No registrants match "${debouncedSearch}" for this event.`
                : 'No one has registered for this event yet.'
            }
          />
        )}

        {!loadingRegs && data && data.registrations.length > 0 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>
                {data.event.title}
              </h2>
              {debouncedSearch && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Showing {data.filtered_count} of {data.total_count} registrations
                </p>
              )}
            </div>

            <div className="table-wrapper">
              <table aria-label={`Registrations for ${data.event.title}`}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th className="hide-mobile">Phone</th>
                    <th className="hide-mobile">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.registrations.map((reg, i) => (
                    <tr key={reg.id}>
                      <td style={{ color: 'var(--color-text-subtle)', width: '40px' }}>
                        {i + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>{reg.name}</td>
                      <td>
                        <a
                          href={`mailto:${reg.email}`}
                          style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                        >
                          {reg.email}
                        </a>
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--color-text-muted)' }}>
                        {reg.phone}
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>
                        {formatDate(reg.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
