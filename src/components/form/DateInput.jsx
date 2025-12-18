import PropTypes from 'prop-types'
import './formControls.css'

const DateInput = ({
  label,
  name,
  value,
  onChange,
  required,
  error,
  max,
  min,
  ...rest
}) => {
  return (
    <label className="form-control">
      <span className="form-control__label">
        {label} {required && <sup>*</sup>}
      </span>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        max={max}
        min={min}
        className={`form-control__input ${error ? 'form-control__input--error' : ''} ${rest.className || ''}`}
        {...rest}
      />
      {error && <span className="form-control__error">{error}</span>}
    </label>
  )
}

DateInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  max: PropTypes.string,
  min: PropTypes.string,
}

export default DateInput

