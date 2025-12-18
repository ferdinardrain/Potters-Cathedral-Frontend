import { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import PropTypes from 'prop-types'
import { FiCalendar } from 'react-icons/fi'
import 'react-datepicker/dist/react-datepicker.css'
import './customDatePicker.css'

const CustomInput = forwardRef(({ value, onClick, label, required, error, placeholder, ...props }, ref) => {
    console.log('CustomInput render:', { value, label })
    return (
        <div className="form-control" onClick={onClick}>
            <label className="form-control__label">
                {label} {required && <sup>*</sup>}
            </label>
            <div className={`custom-datepicker__input-wrapper ${error ? 'custom-datepicker__input-wrapper--error' : ''}`}>
                <input
                    ref={ref}
                    value={value}
                    readOnly
                    className="form-control__input custom-datepicker__input"
                    placeholder={placeholder || 'Select date'}
                    {...props}
                />
                <FiCalendar className="custom-datepicker__icon" />
            </div>
            {error && <span className="form-control__error">{error}</span>}
        </div>
    )
})

CustomInput.displayName = 'CustomInput'

CustomInput.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func,
    label: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.string,
    placeholder: PropTypes.string,
}

const CustomDatePicker = ({
    label,
    name,
    value,
    onChange,
    required,
    error,
    max,
    min,
    placeholder,
    ...rest
}) => {
    console.log('CustomDatePicker render:', { name, value })

    const handleChange = (date) => {
        console.log('CustomDatePicker handleChange:', date)
        // Convert date object to YYYY-MM-DD string for consistency with existing logic
        const formattedDate = date ? date.toISOString().split('T')[0] : ''

        // Create a synthetic event to match the expected interface
        const event = {
            target: {
                name,
                value: formattedDate,
            },
        }
        onChange(event)
    }

    // Handle potential invalid date strings safely
    let selectedDate = null
    if (value) {
        const parsedDate = new Date(value)
        if (!isNaN(parsedDate.getTime())) {
            selectedDate = parsedDate
        }
    }

    console.log('CustomDatePicker selectedDate:', selectedDate)

    return (
        <DatePicker
            selected={selectedDate}
            onChange={handleChange}
            customInput={
                <CustomInput
                    label={label}
                    required={required}
                    error={error}
                    placeholder={placeholder}
                />
            }
            dateFormat="dd/MM/yyyy"
            maxDate={max ? new Date(max) : null}
            minDate={min ? new Date(min) : null}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText={placeholder}
            {...rest}
        />
    )
}

CustomDatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    error: PropTypes.string,
    max: PropTypes.string,
    min: PropTypes.string,
    placeholder: PropTypes.string,
}

export default CustomDatePicker
