"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { MOCK_USERS } from "./mock-data";

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "asha":
      return "/dashboard/asha";
    case "dispatcher":
      return "/ambulances";
    case "admin":
      return "/admin";
    case "hospital":
    default:
      return "/dashboard";
  }
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string, roleOverride?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  getDefaultRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "maira_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from session on client
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } else {
        // Default to hospital doctor for instant demo preview if not logged in
        setUser(MOCK_USERS[0]);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_USERS[0]));
      }
    } catch {
      setUser(MOCK_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    roleOverride?: UserRole
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    // Simulate brief authentication check
    await new Promise((r) => setTimeout(r, 450));

    let matchedUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (roleOverride) {
      matchedUser = MOCK_USERS.find((u) => u.role === roleOverride) || matchedUser;
    }

    if (!matchedUser && !email.includes("@")) {
      setIsLoading(false);
      return { success: false, error: "Please enter a valid government email address or NIC ID." };
    }

    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: "Invalid password. Passwords must be at least 6 characters." };
    }

    const determinedRole = roleOverride || (email.toLowerCase().includes("asha") ? "asha" : matchedUser?.role || "hospital");

    const authenticatedUser: User = matchedUser || {
      id: `usr-${Date.now()}`,
      name: email.split("@")[0].replace(".", " "),
      email,
      role: determinedRole,
      designation: determinedRole === "asha" ? "Accredited Social Health Activist (ASHA)" : "Authorized Healthcare Officer",
      phone: "+91 90000 00000",
      facilityId: determinedRole === "asha" ? "FAC-CHC-04" : "FAC-DH-01",
      facilityName: determinedRole === "asha" ? "Najafgarh Community Health Centre" : "District Women & Child Hospital, Central",
      lastLogin: new Date().toISOString(),
    };

    setUser(authenticatedUser);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    setIsLoading(false);
    return { success: true, role: authenticatedUser.role };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === newRole);
    if (targetUser) {
      setUser(targetUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
    } else if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: true,
        login,
        logout,
        switchRole,
        canAccess,
        getDefaultRoute: () => (user ? getDefaultRouteForRole(user.role) : "/login"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
