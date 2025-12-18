import { apiClient } from './apiClient'

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
]

export const MARITAL_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  ...MARITAL_STATUS_OPTIONS,
]

const STORAGE_KEY = 'church_members'

// LocalStorage helper functions
const getMembersFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveMembersToStorage = (members) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
  } catch (error) {
    console.error('Failed to save members to localStorage:', error)
  }
}

const capitalizeFirst = (str) => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const normalizeMember = (member) => ({
  id: member.id,
  fullName: member.fullName || '',
  age: member.age || '',
  dob: member.dob ? member.dob.split('T')[0] : '',
  residence: member.residence || '',
  gpsAddress: member.gpsAddress || '',
  phoneNumber: member.phoneNumber || '',
  altPhoneNumber: member.altPhoneNumber || '',
  nationality: member.nationality || '',
  maritalStatus: member.maritalStatus ? capitalizeFirst(member.maritalStatus) : '',
  joiningDate: member.joiningDate ? member.joiningDate.split('T')[0] : '',
  avatar: member.avatar || '',
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
})

// Filter members based on search and marital status
const filterMembers = (members, filters) => {
  let filtered = [...members]

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (member) =>
        member.fullName?.toLowerCase().includes(searchLower) ||
        member.phoneNumber?.toLowerCase().includes(searchLower) ||
        member.residence?.toLowerCase().includes(searchLower)
    )
  }

  // Marital status filter
  if (filters.maritalStatus && filters.maritalStatus !== '') {
    filtered = filtered.filter(
      (member) => member.maritalStatus?.toLowerCase() === filters.maritalStatus.toLowerCase()
    )
  }

  return filtered
}

export const memberService = {
  async fetchMembers(filters = {}) {
    // For frontend-only mode, skip API calls and use localStorage directly
    // Only try API if VITE_API_BASE_URL is set and not the default localhost
    // Always try API first, the apiClient handles connection errors
    const useAPI = true

    if (useAPI) {
      try {
        const response = await apiClient.get('/api/members', filters)
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data.map(normalizeMember)
        }
      } catch (error) {
        // If API fails, fall back to localStorage
        console.log('API unavailable, using localStorage')
      }
    }

    // Use localStorage as primary storage for frontend-only mode
    const members = getMembersFromStorage()
    const filtered = filterMembers(members, filters)
    // Normalize all members to ensure consistent data structure
    return filtered.map(normalizeMember)
  },

  async fetchMember(memberId) {
    try {
      // Try API first
      const response = await apiClient.get(`/api/members/${memberId}`)
      if (response?.data) {
        return normalizeMember(response.data)
      }
    } catch (error) {
      // If API fails, fall back to localStorage
    }

    // Use localStorage as fallback
    const members = getMembersFromStorage()
    const member = members.find((m) => m.id === memberId || m.id === String(memberId))
    if (!member) {
      throw new Error('Member not found')
    }
    return normalizeMember(member)
  },

  async createMember(payload) {
    // For frontend-only mode, skip API calls and use localStorage directly
    // Always try API first
    const useAPI = true

    if (useAPI) {
      try {
        const response = await apiClient.post('/api/members', payload)
        if (response?.data) {
          const newMember = normalizeMember(response.data)
          // Also save to localStorage for consistency
          const members = getMembersFromStorage()
          members.push(newMember)
          saveMembersToStorage(members)
          return newMember
        }
      } catch (error) {
        // If API fails, use localStorage
        console.log('API unavailable, using localStorage')
      }
    }

    // Use localStorage as primary storage for frontend-only mode
    const members = getMembersFromStorage()
    const newMember = {
      id: Date.now().toString(), // Generate ID
      fullName: payload.fullName || '',
      age: payload.age || '',
      dob: payload.dob || '',
      residence: payload.residence || '',
      gpsAddress: payload.gpsAddress || '',
      phoneNumber: payload.phoneNumber || '',
      altPhoneNumber: payload.altPhoneNumber || '',
      nationality: payload.nationality || '',
      maritalStatus: payload.maritalStatus || '',
      joiningDate: payload.joiningDate || '',
      avatar: payload.avatar || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    members.push(newMember)
    saveMembersToStorage(members)
    console.log('Member saved to localStorage:', newMember)
    return normalizeMember(newMember)
  },

  async updateMember(memberId, payload) {
    try {
      // Try API first
      const response = await apiClient.put(`/api/members/${memberId}`, payload)
      if (response?.data) {
        const updatedMember = normalizeMember(response.data)
        // Also update localStorage for consistency
        const members = getMembersFromStorage()
        const index = members.findIndex((m) => m.id === memberId || m.id === String(memberId))
        if (index !== -1) {
          members[index] = { ...updatedMember, updatedAt: new Date().toISOString() }
          saveMembersToStorage(members)
        }
        return updatedMember
      }
    } catch (error) {
      // If API fails, use localStorage
    }

    // Use localStorage as fallback
    const members = getMembersFromStorage()
    const index = members.findIndex((m) => m.id === memberId || m.id === String(memberId))
    if (index === -1) {
      throw new Error('Member not found')
    }
    const updatedMember = {
      ...members[index],
      ...payload,
      id: members[index].id,
      updatedAt: new Date().toISOString(),
    }
    members[index] = updatedMember
    saveMembersToStorage(members)
    return normalizeMember(updatedMember)
  },
}

