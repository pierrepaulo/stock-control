"use client";

import { authService } from "@/services/auth.service";
import type { AuthUser, LoginCredentials } from "@/types/auth";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);

    const nextUser: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      isAdmin: data.isAdmin,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));

    setUser(nextUser);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      try {
        await authService.logout();
      } catch {
        // Ignore logout API errors and clear local session anyway.
      }
    }

    clearSession();
    window.location.href = "/login";
  }, [clearSession]);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        if (isActive) {
          setIsLoading(false);
        }
        return;
      }

      const cachedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser) as AuthUser;
          if (isActive) {
            setUser(parsedUser);
          }
        } catch {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }

      try {
        const me = await authService.getMe();
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
        if (isActive) {
          setUser(me);
        }
      } catch {
        clearSession();
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

