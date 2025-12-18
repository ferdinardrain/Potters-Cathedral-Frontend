import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import './customSelect.css'

const CustomSelect = ({
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
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            handleSelect(options[focusedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          break
        default:
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, options])

  const handleSelect = (option) => {
    const syntheticEvent = {
      target: {
        name,
        value: option.value,
      },
    }
    onChange(syntheticEvent)
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    setFocusedIndex(-1)
  }

  return (
    <div className="form-control">
      <label className="form-control__label">
        {label} {required && <sup>*</sup>}
      </label>
      <div className="custom-select" ref={selectRef}>
        <button
          type="button"
          className={`custom-select__trigger ${error ? 'custom-select__trigger--error' : ''} ${isOpen ? 'custom-select__trigger--open' : ''}`}
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`custom-select__value ${!selectedOption ? 'custom-select__value--placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`custom-select__arrow ${isOpen ? 'custom-select__arrow--open' : ''}`}
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="custom-select__dropdown" ref={dropdownRef}>
            <div className="custom-select__options">
              {options.map((option, index) => {
                const isSelected = value === option.value
                const isFocused = index === focusedIndex
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`custom-select__option ${isSelected ? 'custom-select__option--selected' : ''} ${isFocused ? 'custom-select__option--focused' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(option)
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    data-status={option.value.toLowerCase()}
                  >
                    <span className="custom-select__option-label">{option.label}</span>
                    {isSelected && (
                      <svg
                        className="custom-select__option-check"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {error && <span className="form-control__error">{error}</span>}
      <input
        type="hidden"
        name={name}
        value={value || ''}
        {...rest}
      />
    </div>
  )
}

CustomSelect.propTypes = {
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

export default CustomSelect

