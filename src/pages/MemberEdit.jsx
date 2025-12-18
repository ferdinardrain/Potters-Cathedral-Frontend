import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import PageLayout from '../components/layout/PageLayout'
import StatusBanner from '../components/common/StatusBanner'
import TextInput from '../components/form/TextInput'
import CustomSelect from '../components/form/CustomSelect'
import CustomDatePicker from '../components/form/CustomDatePicker'
import { memberService, MARITAL_STATUS_OPTIONS } from '../services/memberService'
import './memberEdit.css'

const MemberEdit = () => {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState({
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
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: 'info', message: '' })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadMember = async () => {
      console.log('Loading member with ID:', memberId)
      try {
        const data = await memberService.fetchMember(memberId)
        console.log('Member data loaded:', data)
        setValues(data)
      } catch (error) {
        console.error('Error loading member:', error)
        if (error.message && !error.message.toLowerCase().includes('failed to fetch')) {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Unable to load member.',
            confirmButtonColor: '#ef4444',
          })
          setStatus({ type: 'error', message: error.message || 'Unable to load member.' })
        }
      } finally {
        setLoading(false)
      }
    }
    loadMember()
  }, [memberId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please select an image file.',
          confirmButtonColor: '#ef4444',
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please select an image smaller than 5MB.',
          confirmButtonColor: '#ef4444',
        })
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setValues((prev) => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerImageUpload = () => {
    document.getElementById('avatar-upload').click()
  }

  const validate = () => {
    const validationErrors = {}
    const requiredFields = ['fullName', 'dob', 'residence', 'phoneNumber', 'nationality', 'joiningDate']

    requiredFields.forEach((field) => {
      if (!values[field]) validationErrors[field] = 'This field is required'
    })

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    try {
      setIsSaving(true)
      await memberService.updateMember(memberId, values)

      window.dispatchEvent(new CustomEvent('memberUpdated'))

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Member updated successfully.',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: true,
      })

      navigate('/members', {
        state: { refresh: true, timestamp: Date.now() },
        replace: false
      })
    } catch (error) {
      if (error.message && !error.message.toLowerCase().includes('failed to fetch')) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to update member.',
          confirmButtonColor: '#ef4444',
        })
        setStatus({ type: 'error', message: error.message || 'Failed to update member.' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Edit Member" subtitle="Update member profile.">
        <div className="member-edit__loading">Loading member details...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Edit Member" subtitle="Update member profile.">
      <StatusBanner
        variant={status.type}
        message={status.message}
        onClose={() => setStatus({ type: 'info', message: '' })}
      />

      <div className="member-edit__container">
        <form onSubmit={handleSubmit} className="member-edit__form">
          {/* Hidden file input */}
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {/* Avatar Section */}
          <div className="member-edit__avatar-section">
            <div
              className="member-edit__avatar-display"
              onClick={triggerImageUpload}
              title="Click to change image"
            >
              {values.avatar ? (
                <img src={values.avatar} alt={values.fullName} className="member-edit__avatar-img" />
              ) : (
                <div className="member-edit__avatar-placeholder">
                  {values.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="member-edit__avatar-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <div className="member-edit__avatar-info">
              <h4>{values.fullName || 'Member Name'}</h4>
              <p>Member ID: {memberId}</p>
              <button
                type="button"
                className="member-edit__change-photo-btn"
                onClick={triggerImageUpload}
              >
                Change Photo
              </button>
            </div>
          </div>

          <div className="member-edit__section">
            <h3 className="member-edit__section-title">Personal Information</h3>
            <div className="member-edit__grid">
              <TextInput
                label="Full Name"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                required
                error={errors.fullName}
              />
              <TextInput
                label="Age"
                name="age"
                type="number"
                value={values.age}
                onChange={handleChange}
                error={errors.age}
              />
              <CustomDatePicker
                label="Date of Birth"
                name="dob"
                value={values.dob}
                onChange={handleChange}
                required
                error={errors.dob}
              />
              <TextInput
                label="Nationality"
                name="nationality"
                value={values.nationality}
                onChange={handleChange}
                required
                error={errors.nationality}
              />
              <CustomSelect
                label="Marital Status"
                name="maritalStatus"
                value={values.maritalStatus}
                onChange={handleChange}
                options={MARITAL_STATUS_OPTIONS}
                error={errors.maritalStatus}
              />
            </div>
          </div>

          <div className="member-edit__section">
            <h3 className="member-edit__section-title">Contact Details</h3>
            <div className="member-edit__grid">
              <TextInput
                label="Phone Number"
                name="phoneNumber"
                value={values.phoneNumber}
                onChange={handleChange}
                required
                error={errors.phoneNumber}
              />
              <TextInput
                label="Alternative Phone"
                name="altPhoneNumber"
                value={values.altPhoneNumber}
                onChange={handleChange}
                error={errors.altPhoneNumber}
              />
              <TextInput
                label="Residence"
                name="residence"
                value={values.residence}
                onChange={handleChange}
                required
                error={errors.residence}
              />
              <TextInput
                label="GPS Address"
                name="gpsAddress"
                value={values.gpsAddress}
                onChange={handleChange}
                error={errors.gpsAddress}
              />
            </div>
          </div>

          <div className="member-edit__section">
            <h3 className="member-edit__section-title">Church Information</h3>
            <div className="member-edit__grid">
              <CustomDatePicker
                label="Date of Joining"
                name="joiningDate"
                value={values.joiningDate}
                onChange={handleChange}
                required
                error={errors.joiningDate}
              />
            </div>
          </div>

          <div className="member-edit__actions">
            <button
              type="button"
              className="member-edit__btn member-edit__btn--cancel"
              onClick={() => navigate('/members')}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="member-edit__btn member-edit__btn--save"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}

export default MemberEdit
