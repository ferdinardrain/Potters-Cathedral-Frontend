import PropTypes from 'prop-types'
import './formControls.css'

const SelectInput = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  required,
  error,
  ...rest
}) => {
  return (
    <label className="form-control">
      <span className="form-control__label">
        {label} {required && <sup>*</sup>}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-control__select ${error ? 'form-control__select--error' : ''}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="form-control__error">{error}</span>}
    </label>
  )
}

SelectInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
}

export default SelectInput

