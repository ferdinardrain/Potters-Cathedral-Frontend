import { useCallback, useEffect, useState } from 'react'
import { memberService } from '../services/memberService'

const defaultFilters = {
  search: '',
  maritalStatus: '',
  minAge: '',
  maxAge: '',
}

export const useMembers = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(defaultFilters)

  const loadMembers = useCallback(async (customFilters = null) => {
    try {
      setLoading(true)
      setError('')
      const filtersToUse = customFilters || filters
      const data = await memberService.fetchMembers(filtersToUse)
      setMembers(data)
    } catch (err) {
      // Suppress "Failed to fetch" messages
      if (err.message && !err.message.toLowerCase().includes('failed to fetch')) {
        setError(err.message || 'Failed to load members')
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // Reload function that uses current filters
  const reload = useCallback(() => {
    loadMembers(filters)
  }, [loadMembers, filters])

  return {
    members,
    loading,
    error,
    filters,
    setFilters,
    reload,
  }
}

