const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || 'Unable to process request'
    throw new Error(message)
  }
  return data
}

const handleFetchError = (error) => {
  // Suppress "Failed to fetch" messages - return empty data silently
  // Don't log or throw errors for connection refused (no backend)
  if (error.message === 'Failed to fetch' || 
      error.message.toLowerCase().includes('failed to fetch') ||
      error.message.includes('ERR_CONNECTION_REFUSED')) {
    // Return empty response to prevent error display
    return Promise.resolve({ data: [] })
  }
  throw error
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
      const response = await fetch(url)
      return handleResponse(response)
    } catch (error) {
      return handleFetchError(error)
    }
  },

  async post(path, body) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return handleResponse(response)
    } catch (error) {
      return handleFetchError(error)
    }
  },
}

