"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

interface RedirectContext {
  url: string;
  context: "generic" | "checkout" | "cart" | "account" | "protected-page";
  timestamp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  googleLogin: () => void;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  verifyResetToken: (
    token: string
  ) => Promise<{ success: boolean; message: string; user?: unknown }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  setRedirectUrl: (
    url: string,
    context?: "generic" | "checkout" | "cart" | "account" | "protected-page"
  ) => void;
  getRedirectUrl: () => string | null;
  getRedirectContext: () => RedirectContext | null;
  clearRedirectUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Helper function to store tokens
  const storeTokens = (token: string, refreshToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      // Store token expiration time (24 hours from now)
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("tokenExpiresAt", expiresAt.toString());
    }
  };

  // Helper function to clear tokens
  const clearTokens = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
    }
  };

  // Helper function to check if token is expired
  const isTokenExpired = (): boolean => {
    if (typeof window !== "undefined") {
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      if (!expiresAt) return true;
      return Date.now() >= parseInt(expiresAt);
    }
    return true;
  };

  // Helper function to make authenticated API requests
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      const data = await response.json();
      if (data.errorCode === "TOKEN_EXPIRED") {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken =
            typeof window !== "undefined"
              ? localStorage.getItem("authToken")
              : null;
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          // Refresh failed, redirect to login
          clearTokens();
          setIsAuthenticated(false);
          setUser(null);
          window.location.href = "/login";
          throw new Error("Authentication failed");
        }
      }
    }

    return response;
  };

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        const refreshTokenValue = localStorage.getItem("refreshToken");

        if (token && refreshTokenValue) {
          try {
            // Check if token is expired
            if (isTokenExpired()) {
              // Try to refresh the token
              const refreshed = await refreshToken();
              if (!refreshed) {
                clearTokens();
                setLoading(false);
                return;
              }
            }

            // Get user profile with current or refreshed token
            const response = await makeAuthenticatedRequest(
              `${API_BASE_URL}/auth/profile`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                // Convert backend user format to frontend format
                const user = {
                  id: data.user.id.toString(),
                  email: data.user.email,
                  name: `${data.user.first_name} ${data.user.last_name}`.trim(),
                  phone: data.user.phone || "",
                  address: data.user.address || "",
                  city: data.user.city || "",
                  zipCode: data.user.zipCode || "",
                  country: data.user.country || "",
                };

                setIsAuthenticated(true);
                setUser(user);
              } else {
                // Token is invalid, clear it
                clearTokens();
              }
            } else {
              // Token is invalid, clear it
              clearTokens();
            }
          } catch (error) {
            console.error("Error checking auth status:", error);
            clearTokens();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [API_BASE_URL]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (
        response.ok &&
        data.success &&
        data.user &&
        data.token &&
        data.refreshToken
      ) {
        // Store tokens and user data
        storeTokens(data.token, data.refreshToken);

        // Convert backend user format to frontend format
        const user = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: `${data.user.first_name} ${data.user.last_name}`.trim(),
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          zipCode: data.user.zipCode || "",
          country: data.user.country || "",
        };

        setIsAuthenticated(true);
        setUser(user);
        return { success: true, message: "Login successful" };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Split the name into firstName and lastName
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (
        response.ok &&
        data.success &&
        data.user &&
        data.token &&
        data.refreshToken
      ) {
        // Store tokens and user data
        storeTokens(data.token, data.refreshToken);

        // Convert backend user format to frontend format
        const user = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: `${data.user.first_name} ${data.user.last_name}`.trim(),
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          zipCode: data.user.zipCode || "",
          country: data.user.country || "",
        };

        setIsAuthenticated(true);
        setUser(user);
        return { success: true, message: "Registration successful" };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API endpoint to invalidate refresh token
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    }

    // Clear all tokens and user data
    clearTokens();
    if (typeof window !== "undefined") {
      localStorage.removeItem("redirectUrl");
      localStorage.removeItem("redirectContext");
    }

    setIsAuthenticated(false);
    setUser(null);
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;

      if (!refreshTokenValue) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token && data.refreshToken) {
        // Store new tokens
        storeTokens(data.token, data.refreshToken);
        return true;
      } else {
        // Refresh failed, clear tokens
        clearTokens();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearTokens();
      return false;
    }
  };

  // Google OAuth login
  const googleLogin = () => {
    if (typeof window !== "undefined") {
      window.location.href = `${API_BASE_URL}/auth/google?state=user`;
    }
  };

  // Forgot password
  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // Verify reset token
  const verifyResetToken = async (
    token: string
  ): Promise<{ success: boolean; message: string; user?: unknown }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
        user: data.user,
      };
    } catch (error) {
      console.error("Verify reset token error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // Reset password
  const resetPassword = async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const setRedirectUrl = (
    url: string,
    context:
      | "generic"
      | "checkout"
      | "cart"
      | "account"
      | "protected-page" = "generic"
  ) => {
    if (typeof window !== "undefined") {
      const redirectContext: RedirectContext = {
        url,
        context,
        timestamp: Date.now(),
      };
      localStorage.setItem("redirectUrl", url);
      localStorage.setItem("redirectContext", JSON.stringify(redirectContext));
    }
  };

  const getRedirectUrl = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("redirectUrl");
    }
    return null;
  };

  const getRedirectContext = (): RedirectContext | null => {
    if (typeof window !== "undefined") {
      const contextStr = localStorage.getItem("redirectContext");
      if (contextStr) {
        try {
          return JSON.parse(contextStr);
        } catch (error) {
          console.error("Error parsing redirect context:", error);
          return null;
        }
      }
    }
    return null;
  };

  const clearRedirectUrl = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("redirectUrl");
      localStorage.removeItem("redirectContext");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        googleLogin,
        forgotPassword,
        verifyResetToken,
        resetPassword,
        refreshToken,
        loading,
        setRedirectUrl,
        getRedirectUrl,
        getRedirectContext,
        clearRedirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
