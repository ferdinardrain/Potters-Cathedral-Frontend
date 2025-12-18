import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/authContext'
import './appSidebar.css'

const NAV_ITEMS = [
  { label: 'Overview', path: '/overview', icon: 'home' },
  { label: 'Members', path: '/members', icon: 'users' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
]

const AppSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        )
      case 'briefcase':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )
      case 'users':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      case 'settings':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="app-sidebar">
      <div>
        <p className="app-sidebar__eyebrow">Potter's Cathedral</p>
      </div>

      <div className="app-sidebar__profile">
        <div className="app-sidebar__avatar" aria-hidden="true">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.username}'s avatar`}
              className="app-sidebar__avatar-img"
            />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                fill="#c2d4f0"
              />
              <path
                d="M12 14C7.58172 14 4 16.134 4 19V22H20V19C20 16.134 16.4183 14 12 14Z"
                fill="#9bb6df"
              />
            </svg>
          )}
        </div>
        <div>
          <strong>{user?.username || 'Admin'}</strong>
          <p>{user?.role || 'Administrator'}</p>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/members' && location.pathname.startsWith('/members'))
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`app-sidebar__nav-item ${isActive ? 'app-sidebar__nav-item--active' : ''}`}
            >
              <span className="app-sidebar__nav-icon" aria-hidden="true">
                {getIcon(item.icon)}
              </span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="app-sidebar__logout">
        <button onClick={handleLogout} className="app-sidebar__logout-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      <footer className="app-sidebar__footer">© 2025 Potter's Cathedral</footer>
    </div>
  )
}

export default AppSidebar


