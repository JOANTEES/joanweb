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
  logout: () => void;
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

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");

        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

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
                localStorage.removeItem("authToken");
              }
            } else {
              // Token is invalid, clear it
              localStorage.removeItem("authToken");
            }
          } catch (error) {
            console.error("Error checking auth status:", error);
            localStorage.removeItem("authToken");
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

      if (response.ok && data.success && data.user && data.token) {
        // Store token and user data
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.token);
        }

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
      // Split the name into first_name and last_name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user && data.token) {
        // Store token and user data
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.token);
        }

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

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("redirectUrl");
      localStorage.removeItem("redirectContext");
    }

    setIsAuthenticated(false);
    setUser(null);
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
