import { useState, useEffect } from 'react'
import { useAuth } from '../context/authContext'
import Swal from 'sweetalert2'
import PageLayout from '../components/layout/PageLayout'
import TextInput from '../components/form/TextInput'
import ImageInput from '../components/form/ImageInput'
import CustomSelect from '../components/form/CustomSelect'
import './settings.css'

const Settings = () => {
  const { user, updateUser } = useAuth()

  const [churchInfo, setChurchInfo] = useState({
    churchName: 'LDS HUB',
    pastorName: '',
    churchAddress: '',
    churchPhone: '',
    churchEmail: '',
    churchWebsite: '',
  })

  const [memberSettings, setMemberSettings] = useState({
    ageThreshold: 18,
    requirePhoneNumber: true,
    requireGPSAddress: false,
    defaultNationality: 'Ghanaian',
  })

  const [userProfile, setUserProfile] = useState({
    userName: 'Lydia Mensah',
    userRole: 'Program director',
    userAffiliation: 'IMPACT HUB',
    avatar: '',
  })

  const [notifications, setNotifications] = useState({
    newMemberAlerts: true,
    memberUpdates: true,
    weeklyReports: false,
    emailNotifications: false,
  })

  useEffect(() => {
    // Load saved settings
    const savedChurchInfo = localStorage.getItem('churchInfo')
    if (savedChurchInfo) {
      try {
        setChurchInfo(JSON.parse(savedChurchInfo))
      } catch (error) {
        console.error('Failed to load church info:', error)
      }
    }

    const savedMemberSettings = localStorage.getItem('memberSettings')
    if (savedMemberSettings) {
      try {
        setMemberSettings(JSON.parse(savedMemberSettings))
      } catch (error) {
        console.error('Failed to load member settings:', error)
      }
    }

    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    } else if (user) {
      // Initialize from auth user if no local profile saved
      setUserProfile(prev => ({
        ...prev,
        userName: user.username || prev.userName,
        userRole: user.role || prev.userRole,
        avatar: user.avatar || prev.avatar,
        userAffiliation: user.affiliation || prev.userAffiliation
      }))
    }

    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
  }, [])

  const handleChurchInfoChange = (event) => {
    const { name, value } = event.target
    setChurchInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleMemberSettingsChange = (event) => {
    const { name, value, type } = event.target
    setMemberSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setUserProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target
    setNotifications((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveChurchInfo = async () => {
    localStorage.setItem('churchInfo', JSON.stringify(churchInfo))
    await Swal.fire({
      icon: 'success',
      title: 'Church Information Saved!',
      text: 'Your church information has been updated successfully.',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })
  }

  const handleSaveMemberSettings = async () => {
    localStorage.setItem('memberSettings', JSON.stringify(memberSettings))
    await Swal.fire({
      icon: 'success',
      title: 'Member Settings Saved!',
      text: 'Member registration settings have been updated.',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })
  }

  const handleSaveProfile = async () => {
    // Start by saving to specific local storage key for Settings page persistence
    localStorage.setItem('userProfile', JSON.stringify(userProfile))

    // Also update global auth context so Sidebar updates immediately
    updateUser({
      username: userProfile.userName,
      role: userProfile.userRole,
      avatar: userProfile.avatar,
      affiliation: userProfile.userAffiliation
    })

    await Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your profile has been saved successfully.',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })
  }

  const handleSaveNotifications = async () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications))
    await Swal.fire({
      icon: 'success',
      title: 'Notifications Saved!',
      text: 'Your notification preferences have been updated.',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
    })
  }



  const nationalityOptions = [
    { value: 'Ghanaian', label: 'Ghanaian' },
    { value: 'Nigerian', label: 'Nigerian' },
    { value: 'Kenyan', label: 'Kenyan' },
    { value: 'South African', label: 'South African' },
    { value: 'Other', label: 'Other' },
  ]

  return (
    <PageLayout>
      <div className="settings">
        {/* Church Information */}
        <section className="settings__section">
          <div className="settings__section-header">
            <div className="settings__section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h2 className="settings__section-title">Church Information</h2>
              <p className="settings__section-description">Update your church details and contact information</p>
            </div>
          </div>
          <div className="settings__section-content">
            <div className="settings__form-grid">
              <TextInput
                label="Church Name"
                name="churchName"
                value={churchInfo.churchName}
                onChange={handleChurchInfoChange}
                required
              />
              <TextInput
                label="Pastor/Minister Name"
                name="pastorName"
                value={churchInfo.pastorName}
                onChange={handleChurchInfoChange}
              />
              <TextInput
                label="Church Address"
                name="churchAddress"
                value={churchInfo.churchAddress}
                onChange={handleChurchInfoChange}
              />
              <TextInput
                label="Phone Number"
                name="churchPhone"
                value={churchInfo.churchPhone}
                onChange={handleChurchInfoChange}
                placeholder="+233 XX XXX XXXX"
              />
              <TextInput
                label="Email Address"
                name="churchEmail"
                type="email"
                value={churchInfo.churchEmail}
                onChange={handleChurchInfoChange}
                placeholder="church@example.com"
              />
              <TextInput
                label="Website"
                name="churchWebsite"
                value={churchInfo.churchWebsite}
                onChange={handleChurchInfoChange}
                placeholder="https://www.example.com"
              />
            </div>
            <div className="settings__actions">
              <button type="button" className="settings__button settings__button--primary" onClick={handleSaveChurchInfo}>
                Save Church Information
              </button>
            </div>
          </div>
        </section>

        {/* Member Registration Settings */}
        <section className="settings__section">
          <div className="settings__section-header">
            <div className="settings__section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 className="settings__section-title">Member Registration Settings</h2>
              <p className="settings__section-description">Configure default settings for member registration</p>
            </div>
          </div>
          <div className="settings__section-content">
            <div className="settings__form-grid">
              <TextInput
                label="Age Threshold (Kids vs Adults)"
                name="ageThreshold"
                type="number"
                value={memberSettings.ageThreshold}
                onChange={handleMemberSettingsChange}
                min={1}
                max={25}
              />
              <CustomSelect
                label="Default Nationality"
                name="defaultNationality"
                value={memberSettings.defaultNationality}
                onChange={handleMemberSettingsChange}
                options={nationalityOptions}
              />
            </div>
            <div className="settings__options">
              <label className="settings__option">
                <input
                  type="checkbox"
                  name="requirePhoneNumber"
                  checked={memberSettings.requirePhoneNumber}
                  onChange={(e) => setMemberSettings(prev => ({ ...prev, requirePhoneNumber: e.target.checked }))}
                />
                <div className="settings__option-content">
                  <span className="settings__option-label">Require Phone Number</span>
                  <span className="settings__option-description">Make phone number mandatory during registration</span>
                </div>
              </label>
              <label className="settings__option">
                <input
                  type="checkbox"
                  name="requireGPSAddress"
                  checked={memberSettings.requireGPSAddress}
                  onChange={(e) => setMemberSettings(prev => ({ ...prev, requireGPSAddress: e.target.checked }))}
                />
                <div className="settings__option-content">
                  <span className="settings__option-label">Require GPS Address</span>
                  <span className="settings__option-description">Make GPS address mandatory during registration</span>
                </div>
              </label>
            </div>
            <div className="settings__actions">
              <button type="button" className="settings__button settings__button--primary" onClick={handleSaveMemberSettings}>
                Save Member Settings
              </button>
            </div>
          </div>
        </section>

        {/* User Profile */}
        <section className="settings__section">
          <div className="settings__section-header">
            <div className="settings__section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2 className="settings__section-title">User Profile</h2>
              <p className="settings__section-description">Update your administrator profile information</p>
            </div>
          </div>
          <div className="settings__section-content">
            <div className="settings__form-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <ImageInput
                  label="Profile Picture"
                  name="avatar"
                  value={userProfile.avatar}
                  onChange={handleProfileChange}
                />
              </div>
              <TextInput
                label="Full Name"
                name="userName"
                value={userProfile.userName}
                onChange={handleProfileChange}
              />
              <TextInput
                label="Role/Position"
                name="userRole"
                value={userProfile.userRole}
                onChange={handleProfileChange}
              />
              <TextInput
                label="Affiliation"
                name="userAffiliation"
                value={userProfile.userAffiliation}
                onChange={handleProfileChange}
              />
            </div>
            <div className="settings__actions">
              <button type="button" className="settings__button settings__button--primary" onClick={handleSaveProfile}>
                Save Profile
              </button>
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="settings__section">
          <div className="settings__section-header">
            <div className="settings__section-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h2 className="settings__section-title">Notification Preferences</h2>
              <p className="settings__section-description">Configure how you receive updates and alerts</p>
            </div>
          </div>
          <div className="settings__section-content">
            <div className="settings__options">
              <label className="settings__option">
                <input
                  type="checkbox"
                  name="newMemberAlerts"
                  checked={notifications.newMemberAlerts}
                  onChange={handleNotificationChange}
                />
                <div className="settings__option-content">
                  <span className="settings__option-label">New Member Alerts</span>
                  <span className="settings__option-description">Get notified when new members are registered</span>
                </div>
              </label>
              <label className="settings__option">
                <input
                  type="checkbox"
                  name="memberUpdates"
                  checked={notifications.memberUpdates}
                  onChange={handleNotificationChange}
                />
                <div className="settings__option-content">
                  <span className="settings__option-label">Member Updates</span>
                  <span className="settings__option-description">Receive alerts when member information is updated</span>
                </div>
              </label>
              <label className="settings__option">
                <input
                  type="checkbox"
                  name="weeklyReports"
                  checked={notifications.weeklyReports}
                  onChange={handleNotificationChange}
                />
                <div className="settings__option-content">
                  <span className="settings__option-label">Weekly Reports</span>
                  <span className="settings__option-description">Receive weekly summary reports of member activities</span>
                </div>
              </label>
              <label className="settings__option">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notifications.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <div className="settings__option-content">
                  <span className="settings__option-label">Email Notifications</span>
                  <span className="settings__option-description">Receive notifications via email</span>
                </div>
              </label>
            </div>
            <div className="settings__actions">
              <button type="button" className="settings__button settings__button--primary" onClick={handleSaveNotifications}>
                Save Notification Preferences
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}

      </div>
    </PageLayout>
  )
}

export default Settings
