import { useCallback, useEffect, useState } from 'react'
import { memberService } from '../services/memberService'

const defaultFilters = {
  search: '',
  maritalStatus: '',
  minAge: '',
  maxAge: '',
  trash: false,
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
      setError(err.message || 'Failed to load members')
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

  const deleteMember = async (id) => {
    try {
      // Optimistically remove from UI
      setMembers(prevMembers => prevMembers.filter(member => member.id !== id))

      await memberService.deleteMember(id)

      // Force fresh reload
      await loadMembers(filters)
    } catch (err) {
      await loadMembers(filters)
      setError(err.message || 'Failed to delete member')
      throw err
    }
  }

  const restoreMember = async (id) => {
    try {
      // Optimistically remove from trash UI
      setMembers(prevMembers => prevMembers.filter(member => member.id !== id))

      await memberService.restoreMember(id)

      // Force fresh reload
      await loadMembers(filters)
    } catch (err) {
      await loadMembers(filters)
      setError(err.message || 'Failed to restore member')
      throw err
    }
  }

  const permanentlyDeleteMember = async (id) => {
    try {
      // Optimistically remove from UI immediately
      setMembers(prevMembers => prevMembers.filter(member => member.id !== id))

      // Then call the backend
      await memberService.permanentlyDeleteMember(id)

      // Force a fresh reload from the server to ensure sync
      await loadMembers(filters)
    } catch (err) {
      // If it fails, reload to restore correct state
      await loadMembers(filters)
      setError(err.message || 'Failed to permanently delete member')
      throw err
    }
  }

  return {
    members,
    loading,
    error,
    filters,
    setFilters,
    reload,
    deleteMember,
    restoreMember,
    permanentlyDeleteMember,
  }
}

