import { useState } from 'react'
import PropTypes from 'prop-types'
import AppSidebar from './AppSidebar'
import './layout.css'

const PageLayout = ({ title, subtitle, actions, sidebar, children, avatarImage, userName, userRole, userAffiliation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <div className={`app-shell ${isMenuOpen ? 'app-shell--menu-open' : ''}`}>
      <button
        className="app-shell__menu-toggle"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isMenuOpen && (
        <div className="app-shell__overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      <aside className={`app-shell__sidebar ${isMenuOpen ? 'app-shell__sidebar--open' : ''}`}>
        <AppSidebar
          avatarImage={avatarImage}
          userName={userName}
          userRole={userRole}
          userAffiliation={userAffiliation}
        />
      </aside>

      <div className="app-shell__content">
        <div className="page">
          {(title || actions) && (
            <header className="page__header">
              {title && (
                <div>
                  <h1>{title}</h1>
                  {subtitle && <p>{subtitle}</p>}
                </div>
              )}
              {actions && (
                <div className="page__header-actions">
                  <div className="page__actions">{actions}</div>
                </div>
              )}
            </header>
          )}
          <div className="page__body">
            {sidebar && <aside className="page__sidebar">{sidebar}</aside>}
            <main className="page__content">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}

PageLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  sidebar: PropTypes.node,
  children: PropTypes.node.isRequired,
  avatarImage: PropTypes.string,
  userName: PropTypes.string,
  userRole: PropTypes.string,
  userAffiliation: PropTypes.string,
}

export default PageLayout

