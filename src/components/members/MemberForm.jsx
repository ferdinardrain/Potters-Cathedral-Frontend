import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import TextInput from '../form/TextInput'
import CustomSelect from '../form/CustomSelect'
import DateInput from '../form/DateInput'
import ImageInput from '../form/ImageInput'
import CountryPicker from '../form/CountryPicker'
import { MARITAL_STATUS_OPTIONS } from '../../services/memberService'
import { COUNTRIES } from '../../utils/countryData'
import { FiUser, FiHome, FiPhone, FiMapPin, FiCalendar, FiChevronRight, FiChevronLeft, FiCheck, FiInfo, FiGlobe } from 'react-icons/fi'
import './memberForm.css'

const defaultValues = {
  fullName: '',
  age: '',
  dob: '',
  residence: '',
  gpsAddress: '',
  phoneNumber: '',
  altPhoneNumber: '',
  nationality: '',
  maritalStatus: '',
  joiningDate: '',
  avatar: '',
}

const MemberForm = ({ initialValues = defaultValues, onSubmit, submitLabel, isSaving }) => {
  // Load registration settings from localStorage
  const settings = useMemo(() => {
    const saved = localStorage.getItem('memberSettings')
    return saved ? JSON.parse(saved) : {
      ageThreshold: 18,
      requirePhoneNumber: true,
      requireGPSAddress: false,
      defaultNationality: 'Ghanaian'
    }
  }, [])

  // STABLE STATE: Initialize once, don't let external re-renders reset active user work
  const [values, setValues] = useState(() => ({ ...defaultValues, ...initialValues }))
  const [phoneCountry, setPhoneCountry] = useState('Ghana')
  const [altPhoneCountry, setAltPhoneCountry] = useState('Ghana')
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track the absolute source of truth for initial data
  const initialValuesRef = useRef(JSON.stringify(initialValues))

  const sortedCountries = useMemo(() =>
    [...COUNTRIES].sort((a, b) => b.dial_code.length - a.dial_code.length),
    [])

  // Sync flags with phone number prefix (Non-destructive)
  useEffect(() => {
    if (values.phoneNumber?.startsWith('+')) {
      const country = sortedCountries.find(c => values.phoneNumber.startsWith(c.dial_code))
      if (country && country.name !== phoneCountry) {
        setPhoneCountry(country.name)
      }
    }
    if (values.altPhoneNumber?.startsWith('+')) {
      const country = sortedCountries.find(c => values.altPhoneNumber.startsWith(c.dial_code))
      if (country && country.name !== altPhoneCountry) {
        setAltPhoneCountry(country.name)
      }
    }
  }, [values.phoneNumber, values.altPhoneNumber, sortedCountries])

  const handleNationalityChange = (country) => {
    setValues(prev => ({ ...prev, nationality: country.nationality }))
    if (errors.nationality) setErrors(prev => ({ ...prev, nationality: '' }))
  }

  // Refined: Updates state but respects local input flow
  const handlePhoneCountryChange = useCallback((country, isAlt = false) => {
    const fieldName = isAlt ? 'altPhoneNumber' : 'phoneNumber'
    const setCountry = isAlt ? setAltPhoneCountry : setPhoneCountry

    setCountry(country.name)

    setValues(prev => {
      const currentValue = prev[fieldName] || ''
      const existingCountry = sortedCountries.find(c => currentValue.startsWith(c.dial_code))

      if (existingCountry) {
        // Keep the existing local number but switch prefix
        const restOfNumber = currentValue.slice(existingCountry.dial_code.length)
        return { ...prev, [fieldName]: country.dial_code + restOfNumber }
      } else {
        // If it was empty or random, just set the new prefix
        if (currentValue.startsWith('+')) {
          return { ...prev, [fieldName]: country.dial_code }
        }
        return { ...prev, [fieldName]: country.dial_code + currentValue }
      }
    })
  }, [sortedCountries])

  // New: Handle typing local number (updates state with full E.164)
  const handleLocalPhoneChange = (e, isAlt = false) => {
    const localValue = e.target.value.replace(/\D/g, '') // strip non-digits
    const fieldName = isAlt ? 'altPhoneNumber' : 'phoneNumber'
    const countryName = isAlt ? altPhoneCountry : phoneCountry
    const country = COUNTRIES.find(c => c.name === countryName) || COUNTRIES.find(c => c.name === 'Ghana')

    const fullNumber = country.dial_code + localValue
    setValues(prev => ({ ...prev, [fieldName]: fullNumber }))

    // Validate length on the fly
    if (country.digits && localValue.length !== country.digits) {
      setErrors(prev => ({ ...prev, [fieldName]: `Number must be ${country.digits} digits for ${country.name}` }))
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  // Helper to extract local part for display
  const getLocalPhoneValue = (fullValue, countryName) => {
    if (!fullValue) return ''
    const country = COUNTRIES.find(c => c.name === countryName)
    if (country && fullValue.startsWith(country.dial_code)) {
      return fullValue.slice(country.dial_code.length)
    }
    return fullValue.replace(/^\+/, '') // Fallback
  }

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return ''
    const birthDate = new Date(dob)
    const todayDate = new Date()
    let age = todayDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = todayDate.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age.toString() : ''
  }

  const isMinor = useMemo(() => {
    const age = Number(values.age)
    const threshold = settings.ageThreshold || 18
    return age > 0 && age < threshold
  }, [values.age, settings.ageThreshold])

  // CRITICAL FIX: Only sync if initialValues itself changes significantly from an external source
  useEffect(() => {
    const currentInitialHash = JSON.stringify(initialValues)
    if (currentInitialHash !== initialValuesRef.current) {
      initialValuesRef.current = currentInitialHash
      setValues(prev => ({ ...prev, ...initialValues }))
    }
  }, [initialValues])

  useEffect(() => {
    if (isMinor && values.maritalStatus) {
      setValues((prev) => ({ ...prev, maritalStatus: '' }))
    }
  }, [isMinor])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => {
      const newValues = { ...prev, [name]: value }
      if (name === 'dob') {
        const calculatedAge = calculateAgeFromDOB(value)
        if (calculatedAge) newValues.age = calculatedAge
      }
      return newValues
    })
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleNext = () => {
    const currentStepFields = steps.find(step => step.id === currentStep)?.fields || []
    const currentStepErrors = {}
    currentStepFields.forEach(field => {
      if (field === 'altPhoneNumber' || field === 'avatar' || field === 'age') return
      if (field === 'maritalStatus' && isMinor) return
      if (!values[field]) currentStepErrors[field] = 'This field is required'
      // Extra validation for phone on Next
      if (field === 'phoneNumber' && values.phoneNumber) {
        const country = COUNTRIES.find(c => c.name === phoneCountry)
        const localPart = getLocalPhoneValue(values.phoneNumber, phoneCountry)
        if (country && country.digits && localPart.length !== country.digits) {
          currentStepErrors[field] = `Number must be ${country.digits} digits for ${country.name}`
        }
      }
    })
    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors)
      return
    }
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1)
  }

  const handlePrev = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1) }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { ...values, age: Number(values.age) }
      if (isMinor) payload.maritalStatus = ''
      await onSubmit(payload)
    } finally { setIsSubmitting(false) }
  }

  const steps = [
    { id: 1, number: 1, title: 'Personal Information', description: 'Tell us about yourself', fields: ['fullName', 'age', 'dob', 'nationality', 'maritalStatus'] },
    { id: 2, number: 2, title: 'Contact Details', description: 'How can we reach you?', fields: ['phoneNumber', 'altPhoneNumber', 'residence', 'gpsAddress'] },
    { id: 3, number: 3, title: 'Church Information', description: 'Your journey with us', fields: ['joiningDate'] },
  ]

  const currentStepData = steps.find((s) => s.id === currentStep)
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === steps.length

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="form-group">
              <ImageInput label="Profile Picture (Optional)" name="avatar" value={values.avatar} onChange={handleChange} error={errors.avatar} />
              <TextInput label="Full Name" name="fullName" value={values.fullName} onChange={handleChange} required error={errors.fullName} icon={<FiUser />} placeholder="John Doe" />
              <div className="form-row">
                <TextInput label="Age" name="age" type="number" value={values.age} onChange={handleChange} min={1} error={errors.age} className="small-input" />
                <DateInput label="Date of Birth" name="dob" value={values.dob} onChange={handleChange} required max={today} error={errors.dob} placeholder="Select Date of Birth" />
              </div>
              <CountryPicker label="Nationality" value={values.nationality} onChange={handleNationalityChange} required error={errors.nationality} placeholder="Select Nationality" type="nationality" />
              {!isMinor && <CustomSelect label="Marital Status" name="maritalStatus" value={values.maritalStatus} onChange={handleChange} required options={MARITAL_STATUS_OPTIONS} error={errors.maritalStatus} icon={<FiUser />} />}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="step-content">
            <div className="form-group">
              <div className="form-control">
                <label className="form-control__label">
                  Phone Number {settings.requirePhoneNumber && <sup>*</sup>}
                </label>
                <div className="phone-input-layout">
                  <CountryPicker value={phoneCountry} onChange={handlePhoneCountryChange} variant="phonePrefix" type="phone" hideLabel={true} />
                  <TextInput
                    name="phoneNumber"
                    value={getLocalPhoneValue(values.phoneNumber, phoneCountry)}
                    onChange={(e) => handleLocalPhoneChange(e, false)}
                    required={settings.requirePhoneNumber}
                    error={errors.phoneNumber}
                    placeholder="Enter numbers only"
                    hideLabel={true}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="form-control__label">Alternative Phone Number (Optional)</label>
                <div className="phone-input-layout">
                  <CountryPicker value={altPhoneCountry} onChange={(c) => handlePhoneCountryChange(c, true)} variant="phonePrefix" type="phone" hideLabel={true} />
                  <TextInput
                    name="altPhoneNumber"
                    value={getLocalPhoneValue(values.altPhoneNumber, altPhoneCountry)}
                    onChange={(e) => handleLocalPhoneChange(e, true)}
                    error={errors.altPhoneNumber}
                    placeholder="Enter numbers only"
                    hideLabel={true}
                  />
                </div>
              </div>
              <TextInput label="Residence" name="residence" value={values.residence} onChange={handleChange} required error={errors.residence} placeholder="Your current address" icon={<FiHome />} />
              <TextInput label="GPS Address" name="gpsAddress" value={values.gpsAddress} onChange={handleChange} required={settings.requireGPSAddress} error={errors.gpsAddress} placeholder="e.g., AB-1234-5678" icon={<FiMapPin />} />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="step-content">
            <div className="form-group">
              <DateInput label="Date of Joining" name="joiningDate" value={values.joiningDate} onChange={handleChange} required max={today} error={errors.joiningDate} />
              <div className="form-note">
                <FiInfo className="info-icon" />
                <p>This helps us keep track of your membership duration and anniversary.</p>
              </div>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="form-container">
      <div className="form-progress">
        {steps.map((step, index) => (
          <div key={step.id} className={`progress-step ${currentStep > step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`} >
            <div className="step-number">{currentStep > step.id ? <FiCheck /> : step.id}</div>
            <div className="step-info">
              <span className="step-title">{step.title}</span>
              <span className="step-description">{step.description}</span>
            </div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-header">
          <h2>{currentStepData?.title}</h2>
          <p className="form-subtitle">{currentStepData?.description}</p>
        </div>
        <div className="form-content">{renderStepContent()}</div>
        <div className="form-actions">
          {!isFirstStep && <button type="button" className="btn btn-outline" onClick={handlePrev} disabled={isSubmitting} ><FiChevronLeft /> Back</button>}
          <div className="form-actions-right">
            {!isLastStep ? (
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={isSubmitting} >Next <FiChevronRight /></button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} >{isSubmitting ? <><span className="spinner"></span> Submitting...</> : submitLabel}</button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

MemberForm.propTypes = {
  initialValues: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullName: PropTypes.string, age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), dob: PropTypes.string, residence: PropTypes.string, gpsAddress: PropTypes.string, phoneNumber: PropTypes.string, altPhoneNumber: PropTypes.string, nationality: PropTypes.string, maritalStatus: PropTypes.string, joiningDate: PropTypes.string, avatar: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSaving: PropTypes.bool,
}

export default MemberForm
