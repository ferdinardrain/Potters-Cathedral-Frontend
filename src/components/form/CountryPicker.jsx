import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FiChevronDown, FiSearch } from 'react-icons/fi'
import { COUNTRIES } from '../../utils/countryData'
import './formControls.css'

const CountryPicker = ({
    label,
    value,
    onChange,
    error,
    required,
    placeholder = 'Select country',
    type = 'nationality', // 'nationality' or 'phone'
    hideLabel = false,
    ...rest
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const dropdownRef = useRef(null)

    const selectedCountry = COUNTRIES.find(c =>
        type === 'nationality' ? c.nationality === value : c.name === value
    )

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nationality.toLowerCase().includes(search.toLowerCase()) ||
        c.dial_code.includes(search)
    )

    const handleSelect = (country) => {
        onChange(country)
        setIsOpen(false)
        setSearch('')
    }

    const isCompact = rest.variant === 'compact'
    const isPhonePrefix = rest.variant === 'phonePrefix'

    const renderFlag = (country) => {
        if (!country) return null
        return (
            <img
                src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                alt={country.name}
                className="country-picker__flag-img"
                style={{ width: '24px', height: 'auto', borderRadius: '2px' }}
            />
        )
    }

    const triggerContent = isPhonePrefix ? (
        <div
            className="country-picker__trigger--prefix-button"
            onClick={() => setIsOpen(!isOpen)}
            tabIndex="0"
        >
            <div className="country-picker__selected-flag-wrapper">
                {renderFlag(selectedCountry)}
            </div>
            <span className="country-picker__selected-dial">{selectedCountry?.dial_code}</span>
            <FiChevronDown className="country-picker__arrow" />
        </div>
    ) : (
        <div
            className={`country-picker__trigger ${error ? 'country-picker__trigger--error' : ''} ${isCompact ? 'country-picker__trigger--compact' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            tabIndex="0"
        >
            {selectedCountry ? (
                <>
                    <div className="country-picker__selected-flag-wrapper">
                        {renderFlag(selectedCountry)}
                    </div>
                    {!isCompact && (
                        <span className="country-picker__selected-name">
                            {type === 'nationality' ? selectedCountry.nationality : selectedCountry.name}
                        </span>
                    )}
                    {isCompact && <FiChevronDown className="country-picker__arrow" />}
                </>
            ) : (
                <span className="country-picker__selected-name" style={{ color: '#94a3b8' }}>
                    {placeholder}
                </span>
            )}
        </div>
    )

    const pickerContent = (
        <div className={`country-picker ${isCompact || isPhonePrefix ? 'country-picker--compact' : ''}`} ref={dropdownRef}>
            {triggerContent}

            {isOpen && (
                <div className="country-picker__dropdown">
                    <div className="country-picker__search">
                        <div className="country-picker__search-wrapper">
                            <FiSearch className="country-picker__search-icon" />
                            <input
                                type="text"
                                className="country-picker__search-input"
                                placeholder={type === 'nationality' ? "Search nationality..." : "Search country..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="country-picker__list">
                        {filteredCountries.map((country) => (
                            <div
                                key={country.code}
                                className={`country-picker__item ${(type === 'nationality' ? country.nationality === value : country.name === value)
                                    ? 'country-picker__item--selected'
                                    : ''
                                    }`}
                                onClick={() => handleSelect(country)}
                            >
                                <div className="country-picker__item-flag-wrapper">
                                    {renderFlag(country)}
                                </div>
                                <span className="country-picker__item-name">{type === 'nationality' ? country.nationality : country.name}</span>
                                <span className="country-picker__dial-code">{country.dial_code}</span>
                            </div>
                        ))}
                        {filteredCountries.length === 0 && (
                            <div className="country-picker__item" style={{ cursor: 'default', color: '#64748b' }}>
                                No countries found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    if (isPhonePrefix) {
        return pickerContent
    }

    return (
        <div className={`form-control ${isCompact ? 'form-control--compact' : ''}`}>
            {label && !hideLabel && (
                <span className="form-control__label">
                    {label} {required && <sup>*</sup>}
                </span>
            )}
            {pickerContent}
            {error && <span className="form-control__error">{error}</span>}
        </div>
    )
}

CountryPicker.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    type: PropTypes.oneOf(['nationality', 'phone']),
    variant: PropTypes.string,
    hideLabel: PropTypes.bool
}

export default CountryPicker
