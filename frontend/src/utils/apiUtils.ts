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

export const uiPatterns = {
  loadingSpinner: {
    className:
      "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent",
  },

  errorDisplay: {
    containerClass:
      "flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md",
    iconClass: "h-4 w-4 text-destructive",
    textClass: "text-sm text-destructive",
  },
}
