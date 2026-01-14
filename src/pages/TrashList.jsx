import { useMemo, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import PageLayout from '../components/layout/PageLayout'
import StatusBanner from '../components/common/StatusBanner'
import TextInput from '../components/form/TextInput'
import CustomSelect from '../components/form/CustomSelect'
import MemberDetailsModal from '../components/members/MemberDetailsModal'
import { useMembers } from '../hooks/useMembers'
import { MARITAL_STATUS_FILTER_OPTIONS } from '../services/memberService'
import { exportService } from '../services/exportService'
import './membersList.css' // Reuse the same styles

const TrashList = () => {
    const location = useLocation()
    const {
        members,
        loading,
        error,
        filters,
        setFilters,
        _reload,
        restoreMember,
        permanentlyDeleteMember
    } = useMembers()
    const [selectedMember, setSelectedMember] = useState(null)

    // Track previous pathname to detect navigation
    const _prevPathnameRef = useRef(location.pathname)

    // Handle initial filters for Trash
    useEffect(() => {
        setFilters(prev => ({ ...prev, trash: true }))
    }, [setFilters])

    const rows = useMemo(() => {
        // Don't show any members until we've loaded with the trash filter
        if (loading || !filters.trash) {
            return []
        }
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
            deletedAt: member.deletedAt,
        }))
    }, [members, loading, filters.trash])

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const getStatusColor = (status) => {
        const colors = {
            Single: { bg: '#dbeafe', text: '#1e40af' },
            Married: { bg: '#fef3c7', text: '#92400e' },
            Divorced: { bg: '#fee2e2', text: '#991b1b' },
            Widowed: { bg: '#e0e7ff', text: '#3730a3' },
        }
        return colors[status] || { bg: '#f3f4f6', text: '#6b7280' }
    }

    const handleRestore = async (memberId, memberName) => {
        const result = await Swal.fire({
            title: 'Restore Member?',
            text: `Do you want to restore ${memberName} to the active members list?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, restore!',
        })

        if (result.isConfirmed) {
            try {
                await restoreMember(memberId)
                await Swal.fire({
                    icon: 'success',
                    title: 'Restored!',
                    text: `${memberName} has been restored.`,
                    confirmButtonColor: '#3b82f6',
                    timer: 2000,
                })
            } catch {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to restore member.',
                    confirmButtonColor: '#ef4444',
                })
            }
        }
    }

    const handlePermanentDelete = async (memberId, memberName) => {
        const result = await Swal.fire({
            title: 'Permanently Delete?',
            text: `Are you sure you want to permanently delete ${memberName}? This action is IRREVERSIBLE.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete Permanently',
        })

        if (result.isConfirmed) {
            try {
                await permanentlyDeleteMember(memberId)
                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: `${memberName} has been permanently removed.`,
                    confirmButtonColor: '#3b82f6',
                    timer: 2000,
                })
            } catch {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete member.',
                    confirmButtonColor: '#ef4444',
                })
            }
        }
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
            { header: 'Phone', key: 'phoneNumber' },
            { header: 'Residence', key: 'residence' },
            { header: 'Status', key: 'maritalStatus' },
            { header: 'Deleted On', key: 'deletedAt' },
        ]

        const exportRows = rows.map(row => ({
            ...row,
            deletedAt: row.deletedAt ? new Date(row.deletedAt).toLocaleDateString() : '—'
        }))

        switch (format) {
            case 'pdf':
                exportService.exportToPDF(exportRows, { title: 'Trashed Members List', fileName: 'Trashed_Members', columns: exportColumns })
                break
            case 'excel':
                exportService.exportToExcel(exportRows, { fileName: 'Trashed_Members', columns: exportColumns })
                break
            case 'csv':
                exportService.exportToCSV(exportRows, { fileName: 'Trashed_Members', columns: exportColumns })
                break
            default:
                break
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
        })
    }

    return (
        <PageLayout
            title="Trash"
            subtitle="Manage deleted members"
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
                </div>
            }
        >
            <div className="members-list__filters">
                <div className="members-list__search">
                    <TextInput
                        label="Search trash"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search deleted members..."
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
                    onClose={() => { }}
                />
            )}

            <div className="members-list__table-wrapper">
                <table className="members-list__table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Member</th>
                            <th>Phone</th>
                            <th>Residence</th>
                            <th>Status</th>
                            <th>Deleted On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr key="loading">
                                <td colSpan="7">Loading trash...</td>
                            </tr>
                        )}
                        {!loading && !filters.trash && (
                            <tr key="initializing">
                                <td colSpan="7">Initializing trash...</td>
                            </tr>
                        )}
                        {!loading && filters.trash && rows.length === 0 && (
                            <tr key="empty">
                                <td colSpan="7">Trash is empty.</td>
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
                                        <td data-label="Phone">{row.phoneNumber || '—'}</td>
                                        <td data-label="Residence">{row.residence || '—'}</td>
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
                                        <td data-label="Deleted On" className="members-list__date">
                                            {row.deletedAt ? new Date(row.deletedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : '—'}
                                        </td>
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
                                                <button
                                                    type="button"
                                                    className="members-list__action"
                                                    title="Restore"
                                                    style={{ color: '#10b981' }}
                                                    onClick={() => handleRestore(row.id, row.fullName)}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="23 4 23 10 17 10" />
                                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="members-list__action"
                                                    title="Delete Permanently"
                                                    style={{ color: '#ef4444' }}
                                                    onClick={() => handlePermanentDelete(row.id, row.fullName)}
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

export default TrashList
