import { useMemo, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import PageLayout from '../components/layout/PageLayout'
import StatusBanner from '../components/common/StatusBanner'
import TextInput from '../components/form/TextInput'
import CustomSelect from '../components/form/CustomSelect'
import MemberDetailsModal from '../components/members/MemberDetailsModal'
import { useMembers } from '../hooks/useMembers'
import { memberService, MARITAL_STATUS_FILTER_OPTIONS } from '../services/memberService'
import './membersList.css'

const MembersList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { members, loading, error, filters, setFilters, reload } = useMembers()
  const [selectedMember, setSelectedMember] = useState(null)

  // Track previous pathname to detect navigation
  const prevPathnameRef = useRef(location.pathname)

  // Reload members when navigating from registration page or when pathname changes
  useEffect(() => {
    const refreshFlag = location.state?.refresh
    const pathnameChanged = prevPathnameRef.current !== location.pathname

    if (refreshFlag || pathnameChanged) {
      // Reload members when coming from registration or when navigating to this page
      const timer = setTimeout(() => {
        reload()
        // Clear the refresh flag if present
        if (refreshFlag) {
          window.history.replaceState({}, document.title, location.pathname)
        }
      }, 200)

      prevPathnameRef.current = location.pathname
      return () => clearTimeout(timer)
    }
  }, [location.pathname, location.state?.refresh, reload])

  const rows = useMemo(() => {
    return members.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      avatar: member.avatar,
      age: member.age,
      dob: member.dob,
      phoneNumber: member.phoneNumber,
      altPhoneNumber: member.altPhoneNumber,
      residence: member.residence,
      gpsAddress: member.gpsAddress,
      nationality: member.nationality,
      maritalStatus: member.maritalStatus,
      joiningDate: member.joiningDate,
    }))
  }, [members])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Get status tag color based on marital status
  const getStatusColor = (status) => {
    const colors = {
      Single: { bg: '#dbeafe', text: '#1e40af' },
      Married: { bg: '#fef3c7', text: '#92400e' },
      Divorced: { bg: '#fee2e2', text: '#991b1b' },
      Widowed: { bg: '#e0e7ff', text: '#3730a3' },
    }
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280' }
  }

  const handleExport = () => {
    // Export functionality - can be implemented later
    Swal.fire({
      icon: 'info',
      title: 'Export',
      text: 'Export functionality will be available soon.',
      confirmButtonColor: '#3b82f6',
    })
  }

  const handleDelete = async (memberId, memberName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${memberName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        // Delete from localStorage (since we're using frontend-only storage)
        const members = JSON.parse(localStorage.getItem('church_members') || '[]')
        const filtered = members.filter((m) => m.id !== memberId && m.id !== String(memberId))
        localStorage.setItem('church_members', JSON.stringify(filtered))

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('memberUpdated'))

        // Reload the members list
        reload()

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${memberName} has been deleted.`,
          confirmButtonColor: '#3b82f6',
          timer: 2000,
        })
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete member. Please try again.',
          confirmButtonColor: '#ef4444',
        })
      }
    }
  }

  return (
    <PageLayout
      title="Members"
      subtitle="Track and manage church members"
      actions={
        <div className="members-list__actions">
          <button type="button" className="members-list__export-btn" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export overview
          </button>
          <button
            type="button"
            className="members-list__new-btn"
            onClick={() => navigate('/members/new')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + New member
          </button>
        </div>
      }
    >
      <div className="members-list__filters">
        <div className="members-list__search">
          <TextInput
            label="Search members"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search members or phone..."
          />
        </div>
        <div className="members-list__filter-group">
          <CustomSelect
            label="Marital Status"
            name="maritalStatus"
            value={filters.maritalStatus || ''}
            onChange={handleFilterChange}
            options={MARITAL_STATUS_FILTER_OPTIONS}
            placeholder="All statuses"
          />
        </div>
      </div>

      {error && (
        <StatusBanner
          variant="error"
          message={error}
          onClose={() => {
            /* noop close */
          }}
        />
      )}

      <div className="members-list__table-wrapper">
        <table className="members-list__table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Member</th>
              <th>Age</th>
              <th>DOB</th>
              <th>Phone</th>
              <th>Alt Phone</th>
              <th>Residence</th>
              <th>GPS Address</th>
              <th>Nationality</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr key="loading">
                <td colSpan="12">Loading members...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr key="empty">
                <td colSpan="12">No members found matching your filters.</td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => {
                const statusColor = getStatusColor(row.maritalStatus)
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="members-list__avatar">
                        {row.avatar ? (
                          <img src={row.avatar} alt={row.fullName} />
                        ) : (
                          <div className="members-list__avatar-placeholder">
                            {row.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="members-list__name">{row.fullName || '—'}</td>
                    <td>{row.age || '—'}</td>
                    <td className="members-list__date">{row.dob || '—'}</td>
                    <td>{row.phoneNumber || '—'}</td>
                    <td>{row.altPhoneNumber || '—'}</td>
                    <td>{row.residence || '—'}</td>
                    <td className="members-list__gps">{row.gpsAddress || '—'}</td>
                    <td>{row.nationality || '—'}</td>
                    <td>
                      <span
                        className="members-list__chip"
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                        }}>
                        {row.maritalStatus || '—'}
                      </span>
                    </td>
                    <td className="members-list__date">{row.joiningDate || '—'}</td>
                    <td>
                      <div className="members-list__action-group">
                        <button
                          type="button"
                          className="members-list__action"
                          title="View Details"
                          onClick={() => setSelectedMember(row)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <Link to={`/members/${row.id}/edit`} className="members-list__action" title="Edit">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          className="members-list__action"
                          title="Delete"
                          onClick={() => handleDelete(row.id, row.fullName)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      <MemberDetailsModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </PageLayout>
  )
}

export default MembersList

