/**
 * API utility for making authenticated requests with automatic token refresh
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

class ApiClient {
  private static instance: ApiClient;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Get the current access token from localStorage
   */
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  /**
   * Get the current refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(token: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      // Store token expiration time (24 hours from now)
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("tokenExpiresAt", expiresAt.toString());
    }
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    if (typeof window !== "undefined") {
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      if (!expiresAt) return true;
      return Date.now() >= parseInt(expiresAt);
    }
    return true;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token && data.refreshToken) {
        // Store new tokens
        this.storeTokens(data.token, data.refreshToken);
        return true;
      } else {
        // Refresh failed, clear tokens
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Make an authenticated API request
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    // If no token and this is an authenticated endpoint, return error
    // Note: /reviews endpoint allows guest submissions (optional auth)
    if (
      !token &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/register") &&
      !endpoint.includes("/auth/forgot-password") &&
      !endpoint.includes("/reviews")
    ) {
      return {
        success: false,
        message: "No authentication token found",
        errorCode: "NO_TOKEN",
      };
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.errorCode === "TOKEN_EXPIRED") {
        // Try to refresh the token
        const refreshed = await this.refreshAccessToken();

        if (refreshed) {
          // Retry the original request with new token
          const newToken = this.getToken();
          if (newToken) {
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };

            const retryResponse = await fetch(url, {
              ...options,
              headers: retryHeaders,
            });

            return await retryResponse.json();
          }
        }

        // Refresh failed, redirect to login
        this.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return {
          success: false,
          message: "Authentication failed. Please log in again.",
          errorCode: "AUTH_FAILED",
        };
      }

      return data;
    } catch (error) {
      console.error("API request error:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export individual methods for convenience
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiClient.get<T>(endpoint, options),
  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ) => apiClient.post<T>(endpoint, data, options),
  put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient.put<T>(endpoint, data, options),
  delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiClient.delete<T>(endpoint, options),
  patch: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ) => apiClient.patch<T>(endpoint, data, options),
  request: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiClient.request<T>(endpoint, options),
};

export default apiClient;
