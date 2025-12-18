import PropTypes from 'prop-types'
import AppSidebar from './AppSidebar'
import './layout.css'

const PageLayout = ({ title, subtitle, actions, sidebar, children, avatarImage, userName, userRole, userAffiliation }) => {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
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

