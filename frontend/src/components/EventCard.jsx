import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import '../styles/events.css'

/** Format a date string nicely */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EventCard({ event }) {
  const canRegister = event.status === 'Upcoming'

  return (
    <article className="event-card" aria-label={`Event: ${event.title}`}>
      {/* Image / Placeholder */}
      <div className="event-card__image-wrap">
        {event.image_url ? (
          <img
            className="event-card__image"
            src={event.image_url}
            alt={event.title}
            loading="lazy"
          />
        ) : (
          <div className="event-card__image-placeholder">🎪</div>
        )}
        <div className="event-card__badge-wrap">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Body */}
      <div className="event-card__body">
        <h2 className="event-card__title">{event.title}</h2>
        <p className="event-card__desc">{event.description}</p>

        {/* Meta */}
        <div className="event-card__meta">
          <div className="event-card__meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="event-card__meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="event-card__footer">
        <div className="event-card__capacity">
          {event.capacity !== null
            ? `${event.registration_count} / ${event.capacity} registered`
            : `${event.registration_count} registered`}
        </div>
        <Link
          to={`/events/${event.id}`}
          className={`event-card__btn${!canRegister ? ' disabled' : ''}`}
          aria-label={canRegister ? `Register for ${event.title}` : `View ${event.title}`}
        >
          {canRegister ? 'Register →' : 'View Details'}
        </Link>
      </div>
    </article>
  )
}
