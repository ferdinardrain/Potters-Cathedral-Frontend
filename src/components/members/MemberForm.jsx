import { useMemo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import TextInput from '../form/TextInput'
import CustomSelect from '../form/CustomSelect'
import DateInput from '../form/DateInput'
import ImageInput from '../form/ImageInput'
import { MARITAL_STATUS_OPTIONS } from '../../services/memberService'
import { FiUser, FiHome, FiPhone, FiMapPin, FiCalendar, FiChevronRight, FiChevronLeft, FiCheck, FiInfo } from 'react-icons/fi'
import './memberForm.css'

const phoneRegex = /^\+?\d{9,15}$/

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
  const [values, setValues] = useState({ ...defaultValues, ...initialValues })
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Calculate age from DOB
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return ''
    const birthDate = new Date(dob)
    const todayDate = new Date()
    let age = todayDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = todayDate.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
      age--
    }
    return age > 0 ? age.toString() : ''
  }

  // Validate that age and DOB match
  const validateAgeAndDOB = (age, dob) => {
    if (!age || !dob) return null
    const calculatedAge = calculateAgeFromDOB(dob)
    if (calculatedAge && calculatedAge !== age.toString()) {
      return 'Age and Date of Birth do not match. Please ensure they are consistent.'
    }
    return null
  }

  const isMinor = useMemo(() => {
    const age = Number(values.age)
    return age > 0 && age < 18
  }, [values.age])

  // Update form values when initialValues changes (for edit mode)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      console.log('Updating form with initialValues:', initialValues)
      setValues({ ...defaultValues, ...initialValues })
    }
  }, [initialValues])

  // Clear marital status when age changes to below 18
  useEffect(() => {
    if (isMinor && values.maritalStatus) {
      setValues((prev) => ({ ...prev, maritalStatus: '' }))
      if (errors.maritalStatus) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.maritalStatus
          return newErrors
        })
      }
    }
  }, [isMinor])

  const validate = () => {
    const validationErrors = {}
    const requiredFields = [
      'fullName',
      'dob',
      'phoneNumber',
      'residence',
      'gpsAddress',
      'nationality',
      'joiningDate',
    ]

    requiredFields.forEach((field) => {
      if (!values[field]) validationErrors[field] = 'This field is required'
    })

    // Validate marital status for adults
    if (!isMinor && !values.maritalStatus) {
      validationErrors.maritalStatus = 'This field is required'
    }

    // Validate phone numbers
    if (values.phoneNumber && !phoneRegex.test(values.phoneNumber)) {
      validationErrors.phoneNumber = 'Invalid phone number format'
    }
    if (values.altPhoneNumber && !phoneRegex.test(values.altPhoneNumber)) {
      validationErrors.altPhoneNumber = 'Invalid phone number format'
    }

    // Validate age and DOB match
    const ageError = validateAgeAndDOB(values.age, values.dob)
    if (ageError) {
      validationErrors.age = ageError
      validationErrors.dob = ageError
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const steps = [
    {
      id: 1,
      number: 1,
      title: 'Personal Information',
      description: 'Tell us about yourself',
      fields: ['fullName', 'age', 'dob', 'nationality', 'maritalStatus'],
    },
    {
      id: 2,
      number: 2,
      title: 'Contact Details',
      description: 'How can we reach you?',
      fields: ['phoneNumber', 'altPhoneNumber', 'residence', 'gpsAddress'],
    },
    {
      id: 3,
      number: 3,
      title: 'Church Information',
      description: 'Your journey with us',
      fields: ['joiningDate'],
    },
  ]

  const currentStepData = steps.find((s) => s.id === currentStep)
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === steps.length

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((prev) => {
      const newValues = { ...prev, [name]: value }

      // Auto-calculate age if DOB changes
      if (name === 'dob') {
        const calculatedAge = calculateAgeFromDOB(value)
        if (calculatedAge) {
          newValues.age = calculatedAge
        }
      }

      return newValues
    })

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleNext = () => {
    const currentStepFields = steps.find(step => step.id === currentStep)?.fields || []
    const currentStepErrors = {}

    currentStepFields.forEach(field => {
      // Skip validation for optional fields
      if (field === 'altPhoneNumber' || field === 'avatar' || field === 'age') return

      // Skip marital status validation for minors
      if (field === 'maritalStatus' && isMinor) return

      if (!values[field]) {
        currentStepErrors[field] = 'This field is required'
      }
    })

    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors)
      return
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (!validate()) {
      setIsSubmitting(false)
      return
    }

    try {
      const payload = { ...values, age: Number(values.age) }
      if (isMinor) {
        payload.maritalStatus = ''
      }

      await onSubmit(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="form-group">
              <ImageInput
                label="Profile Picture (Optional)"
                name="avatar"
                value={values.avatar}
                onChange={handleChange}
                error={errors.avatar}
              />
              <TextInput
                label="Full Name"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                required
                error={errors.fullName}
                icon={<FiUser />}
                placeholder="John Doe"
              />
              <div className="form-row">
                <TextInput
                  label="Age"
                  name="age"
                  type="number"
                  value={values.age}
                  onChange={handleChange}
                  min={1}
                  error={errors.age}
                  className="small-input"
                />
                <DateInput
                  label="Date of Birth"
                  name="dob"
                  value={values.dob}
                  onChange={handleChange}
                  required
                  max={today}
                  error={errors.dob}
                  placeholder="Select Date of Birth"
                />
              </div>
              <TextInput
                label="Nationality"
                name="nationality"
                value={values.nationality}
                onChange={handleChange}
                required
                error={errors.nationality}
                placeholder="e.g., Ghanaian"
              />
              {!isMinor && (
                <CustomSelect
                  label="Marital Status"
                  name="maritalStatus"
                  value={values.maritalStatus}
                  onChange={handleChange}
                  required
                  options={MARITAL_STATUS_OPTIONS}
                  error={errors.maritalStatus}
                  icon={<FiUser />}
                />
              )}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="step-content">
            <div className="form-group">
              <TextInput
                label="Phone Number"
                name="phoneNumber"
                value={values.phoneNumber}
                onChange={handleChange}
                required
                error={errors.phoneNumber}
                placeholder="+233552215589"
                icon={<FiPhone />}
              />
              <TextInput
                label="Alternative Phone Number (Optional)"
                name="altPhoneNumber"
                value={values.altPhoneNumber}
                onChange={handleChange}
                error={errors.altPhoneNumber}
                placeholder="+233552215580"
                icon={<FiPhone />}
              />
              <TextInput
                label="Residence"
                name="residence"
                value={values.residence}
                onChange={handleChange}
                required
                error={errors.residence}
                placeholder="Your current address"
                icon={<FiHome />}
              />
              <TextInput
                label="GPS Address"
                name="gpsAddress"
                value={values.gpsAddress}
                onChange={handleChange}
                required
                error={errors.gpsAddress}
                placeholder="e.g., AB-1234-5678"
                icon={<FiMapPin />}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="step-content">
            <div className="form-group">
              <DateInput
                label="Date of Joining"
                name="joiningDate"
                value={values.joiningDate}
                onChange={handleChange}
                required
                max={today}
                error={errors.joiningDate}
              />
              <div className="form-note">
                <FiInfo className="info-icon" />
                <p>This helps us keep track of your membership duration and anniversary.</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="form-container">
      <div className="form-progress">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${currentStep > step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}
          >
            <div className="step-number">
              {currentStep > step.id ? <FiCheck /> : step.id}
            </div>
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

        <div className="form-content">
          {renderStepContent()}
        </div>

        <div className="form-actions">
          {!isFirstStep && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              <FiChevronLeft /> Back
            </button>
          )}

          <div className="form-actions-right">
            {!isLastStep ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next <FiChevronRight />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> Submitting...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

MemberForm.propTypes = {
  initialValues: PropTypes.shape({
    fullName: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dob: PropTypes.string,
    residence: PropTypes.string,
    gpsAddress: PropTypes.string,
    phoneNumber: PropTypes.string,
    altPhoneNumber: PropTypes.string,
    nationality: PropTypes.string,
    maritalStatus: PropTypes.string,
    joiningDate: PropTypes.string,
    avatar: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSaving: PropTypes.bool,
}

export default MemberForm
