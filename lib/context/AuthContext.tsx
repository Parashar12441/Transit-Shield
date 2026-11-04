"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "OPERATOR" | "USER";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  badgeOrId: string;
  stationOrLocation: string;
  avatarText: string;
  emailOrPhone?: string;
  shiftOrPassType?: string;
}

export const DEFAULT_OPERATOR: AuthUser = {
  id: "OP-4902",
  name: "Neha Sharma",
  role: "OPERATOR",
  badgeOrId: "KCTSL-DISPATCH-4902",
  stationOrLocation: "Kanpur Central Command Hub (Zone 1)",
  avatarText: "NS",
  emailOrPhone: "n.sharma@kctsl.gov.in",
  shiftOrPassType: "Shift 1 (06:00 – 14:00)",
};

export const DEFAULT_COMMUTER: AuthUser = {
  id: "USR-7821",
  name: "Aditya Verma",
  role: "USER",
  badgeOrId: "KNP-PASS-7821",
  stationOrLocation: "IIT Kanpur Terminal (Corridor KE-1)",
  avatarText: "AV",
  emailOrPhone: "+91 98390 12345",
  shiftOrPassType: "Monthly Smart Pass (Student/Commuter)",
};

interface AuthContextType {
  currentUser: AuthUser | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  hasBooted: boolean;
  isInitialized: boolean;
  setHasBooted: (val: boolean) => void;
  login: (user: Partial<AuthUser> & { role: UserRole; name: string }) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  rebootSystem: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("OPERATOR");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasBooted, setHasBooted] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("nexus_auth_session");
      const booted = sessionStorage.getItem("nexus_system_booted");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.currentUser) {
          setCurrentUser(parsed.currentUser);
          setUserRole(parsed.currentUser.role);
          setIsAuthenticated(true);
        }
      }
      if (booted === "true") {
        setHasBooted(true);
      }
    } catch {} finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (userData: Partial<AuthUser> & { role: UserRole; name: string }) => {
    const isOp = userData.role === "OPERATOR";
    const template = isOp ? DEFAULT_OPERATOR : DEFAULT_COMMUTER;
    const finalUser: AuthUser = {
      ...template,
      ...userData,
      avatarText: userData.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || (isOp ? "OP" : "US"),
    };

    setCurrentUser(finalUser);
    setUserRole(finalUser.role);
    setIsAuthenticated(true);
    setHasBooted(true);

    try {
      localStorage.setItem("nexus_auth_session", JSON.stringify({ currentUser: finalUser }));
      sessionStorage.setItem("nexus_system_booted", "true");
    } catch {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("nexus_auth_session");
    } catch {}
  };

  const rebootSystem = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setHasBooted(false);
    try {
      localStorage.removeItem("nexus_auth_session");
      sessionStorage.removeItem("nexus_system_booted");
    } catch {}
  };

  const switchRole = (newRole: UserRole) => {
    const newUser = newRole === "OPERATOR" ? DEFAULT_OPERATOR : DEFAULT_COMMUTER;
    setCurrentUser(newUser);
    setUserRole(newRole);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("nexus_auth_session", JSON.stringify({ currentUser: newUser }));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        isAuthenticated,
        hasBooted,
        isInitialized,
        setHasBooted,
        login,
        logout,
        switchRole,
        rebootSystem,
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

