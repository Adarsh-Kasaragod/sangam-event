import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute — wraps admin routes.
 * Redirects to /admin/login if no token in localStorage.
 * Note: real security is server-side; this is UX-only gating.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
