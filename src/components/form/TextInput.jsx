import PropTypes from 'prop-types'
import './formControls.css'

const TextInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  icon,
  hideLabel = false,
  ...rest
}) => {
  return (
    <div className={`form-control ${rest.className || ''}`}>
      {label && !hideLabel && (
        <label className="form-control__label">
          {label} {required && <sup>*</sup>}
        </label>
      )}
      <div className={`form-control__input-wrapper ${icon ? 'form-control__input-wrapper--with-icon' : ''}`}>
        {icon && <span className="form-control__icon">{icon}</span>}
        <input
          className={`form-control__input ${error ? 'form-control__input--error' : ''} ${rest.className || ''}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          {...rest}
        />
      </div>
      {error && <span className="form-control__error">{error}</span>}
    </div>
  )
}

TextInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  icon: PropTypes.node,
  hideLabel: PropTypes.bool,
}

export default TextInput
