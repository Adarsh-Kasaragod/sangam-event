import { useState, useEffect } from 'react'
import { getEvents } from '../api/api.js'
import EventCard from '../components/EventCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/events.css'

const FILTERS = ['All', 'Upcoming', 'Past', 'Registration Closed']

export default function EventsPage() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState('All')

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const displayed = filter === 'All'
    ? events
    : events.filter((e) => e.status === filter)

  return (
    <>
      <section className="events-hero">
        <div className="container">
          <h1>College Events</h1>
          <p>Discover workshops, fests, and seminars happening on campus. Register in seconds.</p>
        </div>
      </section>

      <section className="events-section">
        <div className="container">
          <div className="events-filter" role="group" aria-label="Filter events">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && <LoadingSpinner text="Fetching events…" />}

          {error && !loading && (
            <div className="alert alert-error">
              ❌ {error}
            </div>
          )}

          {!loading && !error && displayed.length === 0 && (
            <EmptyState
              icon="🗓"
              title="No events found"
              message={
                filter === 'All'
                  ? 'No events have been added yet. Check back soon!'
                  : `No "${filter}" events right now.`
              }
            />
          )}

          {!loading && !error && displayed.length > 0 && (
            <div className="events-grid">
              {displayed.map((event, i) => (
                <div key={event.id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
