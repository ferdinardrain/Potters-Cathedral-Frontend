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
  deletedAt: member.deletedAt || null,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
})

export const memberService = {
  async fetchMembers(filters = {}) {
    const response = await apiClient.get('/api/members', filters)
    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(normalizeMember)
    }
    return []
  },

  async fetchMember(memberId) {
    const response = await apiClient.get(`/api/members/${memberId}`)
    if (response?.data) {
      return normalizeMember(response.data)
    }
    throw new Error('Member not found')
  },

  async createMember(payload) {
    const response = await apiClient.post('/api/members', payload)
    if (response?.data) {
      return normalizeMember(response.data)
    }
    throw new Error('Failed to create member')
  },

  async fetchStats() {
    const response = await apiClient.get('/api/members/stats')
    if (response?.data) {
      return response.data
    }
    throw new Error('Failed to fetch stats')
  },

  async updateMember(memberId, payload) {
    const response = await apiClient.put(`/api/members/${memberId}`, payload)
    if (response?.data) {
      return normalizeMember(response.data)
    }
    throw new Error('Failed to update member')
  },

  async deleteMember(memberId) {
    await apiClient.delete(`/api/members/${memberId}`)
  },

  async restoreMember(memberId) {
    const response = await apiClient.post(`/api/members/${memberId}/restore`)
    return response.data
  },

  async permanentlyDeleteMember(memberId) {
    console.log('[Frontend] Calling permanent delete for ID:', memberId)
    const url = `/api/members/${memberId}/permanent`
    console.log('[Frontend] DELETE URL:', url)
    try {
      const result = await apiClient.delete(url)
      console.log('[Frontend] Permanent delete successful:', result)
      return result
    } catch (error) {
      console.error('[Frontend] Permanent delete failed:', error)
      throw error
    }
  },
}

