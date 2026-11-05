const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, { body, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (response.status === 204) {
    return null
  }

  const result = await response.json()
  if (!response.ok) {
    const error = new Error(result.error || 'The request could not be completed')
    error.status = response.status
    throw error
  }

  return result
}
