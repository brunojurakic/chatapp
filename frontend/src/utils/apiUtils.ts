const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

export const tokenUtils = {
  get: () => localStorage.getItem("jwt_token"),

  set: (token: string) => localStorage.setItem("jwt_token", token),

  remove: () => localStorage.removeItem("jwt_token"),

  exists: () => !!localStorage.getItem("jwt_token"),
}

export const apiUtils = {
  authenticatedRequest: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const token = tokenUtils.get()
    if (!token) {
      throw new Error("No authentication token available")
    }

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })
  },

  post: async (
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<Response> => {
    return apiUtils.authenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  put: async (
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<Response> => {
    return apiUtils.authenticatedRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  get: async (endpoint: string): Promise<Response> => {
    return apiUtils.authenticatedRequest(endpoint, {
      method: "GET",
    })
  },
}

export const errorUtils = {
  log: (message: string, error: unknown) => {
    console.error(`${message}:`, error)
  },

  handleApiError: (operation: string, error: unknown) => {
    errorUtils.log(`${operation} failed`, error)
  },
}
