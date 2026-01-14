const FALLBACK_URL = import.meta.env.PROD
  ? 'https://potter-s-cathedral-backend.onrender.com'
  : 'http://localhost:3000';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || FALLBACK_URL).trim().replace(/\/$/, '')
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || data?.error || 'Unable to process request'
    throw new Error(message)
  }
  return data
}

const handleFetchError = (error) => {
  console.error('API Connection Error:', error)
  if (error.message === 'Failed to fetch') {
    throw new Error('Network error: Could not reach the server. Please check your internet connection or if the backend is live.')
  }
  throw error
}

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' }
  try {
    const authData = localStorage.getItem('porters_auth')
    if (authData) {
      const { user } = JSON.parse(authData)
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }
    }
  } catch (error) {
    console.error('Error reading auth token:', error)
  }
  return headers
}

export const apiClient = {
  async get(path, params = {}) {
    try {
      const url = new URL(`${API_BASE}${path}`)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, value)
        }
      })
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      return handleResponse(response)
    } catch (error) {
      return handleFetchError(error)
    }
  },

  async post(path, body) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      })
      return handleResponse(response)
    } catch (error) {
      return handleFetchError(error)
    }
  },

  async put(path, body) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      })
      return handleResponse(response)
    } catch (error) {
      return handleFetchError(error)
    }
  },

  async delete(path) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      return handleResponse(response)
    } catch (error) {
      return handleFetchError(error)
    }
  },
}
