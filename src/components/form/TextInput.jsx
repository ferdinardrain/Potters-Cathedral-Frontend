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
  ...rest
}) => {
  return (
    <label className="form-control">
      <span className="form-control__label">
        {label} {required && <sup>*</sup>}
      </span>
      <input
        className={`form-control__input ${error ? 'form-control__input--error' : ''} ${rest.className || ''}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
      {error && <span className="form-control__error">{error}</span>}
    </label>
  )
}

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
}

export default TextInput

