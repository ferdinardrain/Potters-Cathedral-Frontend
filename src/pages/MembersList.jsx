import { useMemo, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import PageLayout from '../components/layout/PageLayout'
import StatusBanner from '../components/common/StatusBanner'
import TextInput from '../components/form/TextInput'
import CustomSelect from '../components/form/CustomSelect'
import MemberDetailsModal from '../components/members/MemberDetailsModal'
import { useMembers } from '../hooks/useMembers'
import { MARITAL_STATUS_FILTER_OPTIONS } from '../services/memberService'
import { exportService } from '../services/exportService'
import './membersList.css'

const MembersList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { members, loading, error, filters, setFilters, reload, deleteMember } = useMembers()
  const [selectedMember, setSelectedMember] = useState(null)

  // Track previous pathname to detect navigation
  const prevPathnameRef = useRef(location.pathname)

  // Handle initial filters from navigation state
  useEffect(() => {
    const refreshFlag = location.state?.refresh
    const initialFilters = location.state?.filters

    if (initialFilters) {
      setFilters(initialFilters)
      // Clear history state to avoid re-applying on every render
      window.history.replaceState({}, document.title, location.pathname)
    } else if (refreshFlag) {
      reload()
      // Clear history state
      window.history.replaceState({}, document.title, location.pathname)
    } else if (prevPathnameRef.current !== location.pathname) {
      reload()
    }

    prevPathnameRef.current = location.pathname
  }, [location.pathname, location.state, reload, setFilters])

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

  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)

  // Handle click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = (format) => {
    setShowExportMenu(false)
    const exportColumns = [
      { header: 'Full Name', key: 'fullName' },
      { header: 'Age', key: 'age' },
      { header: 'DOB', key: 'dob' },
      { header: 'Phone', key: 'phoneNumber' },
      { header: 'Residence', key: 'residence' },
      { header: 'GPS Address', key: 'gpsAddress' },
      { header: 'Nationality', key: 'nationality' },
      { header: 'Status', key: 'maritalStatus' },
      { header: 'Joining Date', key: 'joiningDate' },
    ]

    switch (format) {
      case 'pdf':
        // Pass the full memoized 'rows' which includes the 'avatar' property
        exportService.exportToPDF(rows, { title: 'Church Members List', fileName: 'Members_List', columns: exportColumns })
        break
      case 'excel':
        exportService.exportToExcel(rows, { fileName: 'Members_List', columns: exportColumns })
        break
      case 'csv':
        exportService.exportToCSV(rows, { fileName: 'Members_List', columns: exportColumns })
        break
      default:
        break
    }
  }

  const handleDelete = async (memberId, memberName) => {
    const result = await Swal.fire({
      title: 'Move to Trash?',
      text: `Do you want to move ${memberName} to the trash? You can restore them later.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move to trash',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await deleteMember(memberId)

        await Swal.fire({
          icon: 'success',
          title: 'Moved to Trash!',
          text: `${memberName} has been moved to the trash.`,
          confirmButtonColor: '#3b82f6',
          timer: 2000,
        })
      } catch {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to move member to trash. Please try again.',
          confirmButtonColor: '#ef4444',
        })
      }
    }
  }

  const handleViewImage = (avatar, name) => {
    if (!avatar) return
    Swal.fire({
      title: name,
      imageUrl: avatar,
      imageAlt: name,
      showCloseButton: true,
      showConfirmButton: false,
      className: 'avatar-preview-modal',
    })
  }

  return (
    <PageLayout
      title="Members"
      subtitle="Track and manage church members"
      actions={
        <div className="members-list__actions">
          <div className="members-list__export-wrapper" ref={exportMenuRef}>
            <button
              type="button"
              className="members-list__export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>

            {showExportMenu && (
              <div className="export-dropdown">
                <button className="export-dropdown__item" onClick={() => handleExport('pdf')}>
                  <div className="export-dropdown__icon export-dropdown__icon--pdf">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  PDF Document
                </button>
                <button className="export-dropdown__item" onClick={() => handleExport('excel')}>
                  <div className="export-dropdown__icon export-dropdown__icon--excel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  Excel Spreadsheet
                </button>
                <button className="export-dropdown__item" onClick={() => handleExport('csv')}>
                  <div className="export-dropdown__icon export-dropdown__icon--csv">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  CSV Text File
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="members-list__new-btn"
            onClick={() => navigate('/members/new')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Member
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
                    <td data-label="Avatar">
                      <div
                        className={`members-list__avatar ${row.avatar ? 'members-list__avatar--clickable' : ''}`}
                        onClick={() => row.avatar && handleViewImage(row.avatar, row.fullName)}
                        title={row.avatar ? 'Click to view full image' : ''}
                      >
                        {row.avatar ? (
                          <img src={row.avatar} alt={row.fullName} />
                        ) : (
                          <div className="members-list__avatar-placeholder">
                            {row.fullName ? row.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-label="Member" className="members-list__name">{row.fullName || '—'}</td>
                    <td data-label="Age">{row.age || '—'}</td>
                    <td data-label="DOB" className="members-list__date">{row.dob || '—'}</td>
                    <td data-label="Phone">{row.phoneNumber || '—'}</td>
                    <td data-label="Alt Phone">{row.altPhoneNumber || '—'}</td>
                    <td data-label="Residence">{row.residence || '—'}</td>
                    <td data-label="GPS Address" className="members-list__gps">{row.gpsAddress || '—'}</td>
                    <td data-label="Nationality">{row.nationality || '—'}</td>
                    <td data-label="Status">
                      <span
                        className="members-list__chip"
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                        }}>
                        {row.maritalStatus || '—'}
                      </span>
                    </td>
                    <td data-label="Joined" className="members-list__date">{row.joiningDate || '—'}</td>
                    <td data-label="Actions">
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

