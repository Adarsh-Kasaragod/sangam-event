import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../api/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import '../styles/admin.css'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container admin-page"><LoadingSpinner text="Loading dashboard…" /></div>
  if (error)   return <div className="container admin-page"><div className="alert alert-error">❌ {error}</div></div>

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's a snapshot of your event portal.</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card" style={{ animationDelay: '0s' }}>
            <div className="stat-card__icon stat-card__icon--purple">🎪</div>
            <div>
              <div className="stat-card__label">Total Events</div>
              <div className="stat-card__value">{stats.total_events}</div>
              <div className="stat-card__sub">All-time events</div>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.07s' }}>
            <div className="stat-card__icon stat-card__icon--blue">📝</div>
            <div>
              <div className="stat-card__label">Registrations</div>
              <div className="stat-card__value">{stats.total_registrations}</div>
              <div className="stat-card__sub">Across all events</div>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.14s' }}>
            <div className="stat-card__icon stat-card__icon--green">📅</div>
            <div>
              <div className="stat-card__label">Upcoming</div>
              <div className="stat-card__value">{stats.upcoming_events}</div>
              <div className="stat-card__sub">Events still ahead</div>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.21s' }}>
            <div className="stat-card__icon stat-card__icon--orange">⚡</div>
            <div>
              <div className="stat-card__label">Avg. Reg / Event</div>
              <div className="stat-card__value">
                {stats.total_events > 0
                  ? Math.round(stats.total_registrations / stats.total_events)
                  : 0}
              </div>
              <div className="stat-card__sub">Registrations per event</div>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Quick Access
        </h2>
        <div className="dash-links">
          <Link to="/admin/events" className="dash-link-card">
            <div className="dash-link-card__icon">🗂</div>
            <div>
              <div className="dash-link-card__title">Manage Events</div>
              <div className="dash-link-card__sub">Create, edit, and delete events</div>
            </div>
          </Link>
          <Link to="/admin/registrations" className="dash-link-card">
            <div className="dash-link-card__icon">📋</div>
            <div>
              <div className="dash-link-card__title">View Registrations</div>
              <div className="dash-link-card__sub">Browse and search registrant data</div>
            </div>
          </Link>
          <Link to="/admin/events/new" className="dash-link-card">
            <div className="dash-link-card__icon">➕</div>
            <div>
              <div className="dash-link-card__title">Add New Event</div>
              <div className="dash-link-card__sub">Create a new college event</div>
            </div>
          </Link>
        </div>

        {stats.recent_registrations.length > 0 && (
          <div className="recent-section">
            <h2>Recent Registrations</h2>
            <div className="table-wrapper">
              <table aria-label="Recent registrations">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_registrations.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.event_title}</td>
                      <td style={{ color: 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>
                        {timeAgo(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
