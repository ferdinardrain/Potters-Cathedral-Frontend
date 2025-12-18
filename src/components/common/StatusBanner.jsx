import PropTypes from 'prop-types'
import './statusBanner.css'

const STATUS_STYLES = {
  success: 'status-banner--success',
  error: 'status-banner--error',
  info: 'status-banner--info',
}

const StatusBanner = ({ variant = 'info', title, message, onClose }) => {
  if (!message) return null

  return (
    <div className={`status-banner ${STATUS_STYLES[variant]}`}>
      <div>
        {title && <strong>{title}</strong>}
        <p>{message}</p>
      </div>
      {onClose && (
        <button className="status-banner__close" type="button" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  )
}

StatusBanner.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
}

export default StatusBanner

