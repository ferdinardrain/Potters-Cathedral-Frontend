import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './formControls.css'

const ImageInput = ({ label, name, value, onChange, required, error, ...rest }) => {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(value || '')

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setPreview(base64String)
        // Create a synthetic event object to match the expected onChange signature
        const syntheticEvent = {
          target: {
            name,
            value: base64String,
          },
        }
        onChange(syntheticEvent)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    const syntheticEvent = {
      target: {
        name,
        value: '',
      },
    }
    onChange(syntheticEvent)
  }

  return (
    <label className="form-control">
      <span className="form-control__label">
        {label} {required && <sup>*</sup>}
      </span>
      <div className="form-control__image-wrapper">
        {preview ? (
          <div className="form-control__image-preview">
            <img src={preview} alt="Preview" />
            <button
              type="button"
              className="form-control__image-remove"
              onClick={handleRemove}
              aria-label="Remove image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="form-control__image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Click to upload image</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept="image/*"
          onChange={handleFileChange}
          className="form-control__image-input"
          {...rest}
        />
      </div>
      {error && <span className="form-control__error">{error}</span>}
    </label>
  )
}

ImageInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
}

export default ImageInput

