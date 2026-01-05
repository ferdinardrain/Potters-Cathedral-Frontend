import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import PageLayout from '../components/layout/PageLayout'
import StatusBanner from '../components/common/StatusBanner'
import MemberForm from '../components/members/MemberForm'
import { memberService } from '../services/memberService'
import './memberRegistration.css'

const MemberRegistration = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState({ type: 'info', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (payload) => {
    try {
      setIsSaving(true)
      const member = await memberService.createMember(payload)

      // Dispatch custom event to notify other components (like Overview)
      window.dispatchEvent(new CustomEvent('memberUpdated'))

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Member registered successfully.',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: true,
      })

      // Navigate to members list so the new member appears in the table
      navigate('/members', {
        state: { refresh: true, timestamp: Date.now() },
        replace: false
      })
    } catch (error) {
      // Suppress "Failed to fetch" messages
      if (error.message && !error.message.toLowerCase().includes('failed to fetch')) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to register member. Please try again.',
          confirmButtonColor: '#ef4444',
        })
        setStatus({
          type: 'error',
          message: error.message || 'Failed to register member. Please try again.',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageLayout>
      <StatusBanner
        variant={status.type}
        message={status.message}
        onClose={() => setStatus({ type: 'info', message: '' })}
      />
      <div className="registration-page">
        <div className="registration__background">
          <div className="registration__gradient registration__gradient--1"></div>
          <div className="registration__gradient registration__gradient--2"></div>
          <div className="registration__gradient registration__gradient--3"></div>
        </div>
        <div className="registration__card">
          <button
            className="registration__close-btn"
            onClick={() => navigate('/members')}
            aria-label="Close registration"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <MemberForm submitLabel="Register Member" onSubmit={handleSubmit} isSaving={isSaving} />
        </div>
      </div>
    </PageLayout>
  )
}

export default MemberRegistration

