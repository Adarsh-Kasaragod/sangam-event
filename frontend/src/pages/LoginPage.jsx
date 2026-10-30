import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { adminLogin } from '../api/api.js'
import '../styles/admin.css'

export default function LoginPage() {
  if (localStorage.getItem('admin_token')) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Both fields are required.')
      return
    }

    setLoading(true)
    try {
      const { token, admin } = await adminLogin(email.trim(), password)
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_info', JSON.stringify(admin))
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__icon">🔐</div>

        <h1>Admin Login</h1>
        <p className="login-card__subtitle">
          Sign in to access the Sangam Event Portal dashboard
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="Your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.25rem',
                }}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : '🔓 Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
