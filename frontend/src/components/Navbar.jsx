import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const token = localStorage.getItem('admin_token')
  const isAdmin = Boolean(token)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    setMenuOpen(false)
    navigate('/admin/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <div className="navbar__logo-icon">S</div>
          <span className="navbar__logo-text">Sangam</span>
        </Link>

        <button
          className="navbar__hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar__links${menuOpen ? ' open' : ''}`} role="list">
          <li>
            <NavLink to="/" end onClick={closeMenu}>
              Events
            </NavLink>
          </li>

          {isAdmin ? (
            <>
              <li>
                <span className="navbar__admin-badge">Admin</span>
              </li>
              <li>
                <NavLink to="/admin/dashboard" onClick={closeMenu}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/events" onClick={closeMenu}>
                  Manage Events
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/registrations" onClick={closeMenu}>
                  Registrations
                </NavLink>
              </li>
              <li>
                <button
                  className="navbar__logout-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/admin/login" onClick={closeMenu}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}
