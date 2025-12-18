import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import StatusBanner from '../components/common/StatusBanner'
import { memberService } from '../services/memberService'
import './memberDetails.css'

const MemberDetails = () => {
  const { memberId } = useParams()
  const [member, setMember] = useState(null)
  const [status, setStatus] = useState({ type: 'info', message: '' })

  useEffect(() => {
    const loadMember = async () => {
      try {
        const data = await memberService.fetchMember(memberId)
        setMember(data)
      } catch (error) {
        // Suppress "Failed to fetch" messages
        if (error.message && !error.message.toLowerCase().includes('failed to fetch')) {
          setStatus({ type: 'error', message: error.message || 'Member not found.' })
        }
      }
    }
    loadMember()
  }, [memberId])

  if (!member && status.message) {
    return (
      <PageLayout title="Member Details" subtitle="Full member profile.">
        <StatusBanner variant={status.type} message={status.message} />
      </PageLayout>
    )
  }

  if (!member) {
    return (
      <PageLayout title="Member Details" subtitle="Full member profile.">
        <p>Loading member profile...</p>
      </PageLayout>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      Single: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
      Married: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      Divorced: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      Widowed: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
    }
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' }
  }

  const statusColor = getStatusColor(member.maritalStatus)

  return (
    <PageLayout title={member.fullName} subtitle="Full profile details.">
      <div className="member-details__card">
        <div className="member-details__header">
          <div className="member-details__avatar">
            {member.avatar ? (
              <img src={member.avatar} alt={member.fullName} />
            ) : (
              <span>{member.fullName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="member-details__header-info">
            <h2 className="member-details__name">{member.fullName}</h2>
            <div className="member-details__badges">
              <span
                className="member-details__status-badge"
                style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                  borderColor: statusColor.border,
                }}>
                {member.maritalStatus}
              </span>
              <span className="member-details__meta-badge">
                Joined {member.joiningDate}
              </span>
            </div>
          </div>
          <Link to={`/members/${member.id}/edit`} className="member-details__edit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Member
          </Link>
        </div>

        <div className="member-details__grid">
          <section className="member-details__section">
            <div className="member-details__section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h3>Personal Information</h3>
            </div>
            <div className="member-details__fields">
              <div className="member-details__field">
                <span className="member-details__field-label">Full Name</span>
                <p className="member-details__field-value">{member.fullName}</p>
              </div>
              <div className="member-details__field">
                <span className="member-details__field-label">Age</span>
                <p className="member-details__field-value">{member.age} years</p>
              </div>
              <div className="member-details__field">
                <span className="member-details__field-label">Date of Birth</span>
                <p className="member-details__field-value">{member.dob}</p>
              </div>
              <div className="member-details__field">
                <span className="member-details__field-label">Nationality</span>
                <p className="member-details__field-value">{member.nationality}</p>
              </div>
            </div>
          </section>

          <section className="member-details__section">
            <div className="member-details__section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <h3>Contact & Residence</h3>
            </div>
            <div className="member-details__fields">
              <div className="member-details__field">
                <span className="member-details__field-label">Phone Number</span>
                <p className="member-details__field-value">{member.phoneNumber}</p>
              </div>
              <div className="member-details__field">
                <span className="member-details__field-label">Alternative Phone</span>
                <p className="member-details__field-value">{member.altPhoneNumber || 'Not provided'}</p>
              </div>
              <div className="member-details__field">
                <span className="member-details__field-label">Residence</span>
                <p className="member-details__field-value">{member.residence}</p>
              </div>
              <div className="member-details__field">
                <span className="member-details__field-label">GPS Address</span>
                <p className="member-details__field-value">{member.gpsAddress}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  )
}

export default MemberDetails

