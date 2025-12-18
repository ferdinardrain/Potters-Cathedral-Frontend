import PropTypes from 'prop-types'
import { FiX } from 'react-icons/fi'
import './memberDetailsModal.css'

const MemberDetailsModal = ({ member, onClose }) => {
    if (!member) return null

    return (
        <div className="member-details-modal-overlay" onClick={onClose}>
            <div className="member-details-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="member-details-modal-header">
                    <h3>Member Details</h3>
                    <button type="button" className="member-details-close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="member-details-modal-body">
                    <div className="member-details-avatar-section">
                        <div className="member-details-avatar-large">
                            {member.avatar ? (
                                <img src={member.avatar} alt={member.fullName} />
                            ) : (
                                <span className="member-details-avatar-initial">
                                    {member.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        <h4 className="member-details-name">{member.fullName || 'Unknown'}</h4>
                    </div>

                    <div className="member-details-section">
                        <h4>Personal Information</h4>
                        <div className="member-details-grid">
                            <div className="member-details-item">
                                <span className="member-details-label">Full Name</span>
                                <span className="member-details-value">{member.fullName || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">Age</span>
                                <span className="member-details-value">{member.age || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">Date of Birth</span>
                                <span className="member-details-value">{member.dob || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">Nationality</span>
                                <span className="member-details-value">{member.nationality || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">Marital Status</span>
                                <span className="member-details-value">{member.maritalStatus || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="member-details-section">
                        <h4>Contact Details</h4>
                        <div className="member-details-grid">
                            <div className="member-details-item">
                                <span className="member-details-label">Phone Number</span>
                                <span className="member-details-value">{member.phoneNumber || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">Alt. Phone Number</span>
                                <span className="member-details-value">{member.altPhoneNumber || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">Residence</span>
                                <span className="member-details-value">{member.residence || '-'}</span>
                            </div>
                            <div className="member-details-item">
                                <span className="member-details-label">GPS Address</span>
                                <span className="member-details-value">{member.gpsAddress || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="member-details-section">
                        <h4>Church Information</h4>
                        <div className="member-details-grid">
                            <div className="member-details-item">
                                <span className="member-details-label">Date of Joining</span>
                                <span className="member-details-value">{member.joiningDate || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="member-details-modal-footer">
                    <button type="button" className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

MemberDetailsModal.propTypes = {
    member: PropTypes.object,
    onClose: PropTypes.func.isRequired,
}

export default MemberDetailsModal
