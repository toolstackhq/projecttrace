import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { request } from "./api/client";
import { clearAuthToken, getAuthToken, setAuthToken } from "./lib/auth";
import type { UserRead } from "./types/api";

interface AuthStatus {
  bootstrap_required: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserRead;
}

interface AuthContextValue {
  currentUser: UserRead | null;
  token: string | null;
  bootstrapRequired: boolean;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [currentUser, setCurrentUser] = useState<UserRead | null>(null);
  const [bootstrapRequired, setBootstrapRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshCurrentUser() {
    if (!getAuthToken()) {
      setCurrentUser(null);
      return;
    }
    try {
      const user = await request<UserRead>("/auth/me");
      setCurrentUser(user);
    } catch {
      clearAuthToken();
      setToken(null);
      setCurrentUser(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAuthState() {
      setLoading(true);
      try {
        const status = await request<AuthStatus>("/auth/status");
        if (!cancelled) setBootstrapRequired(status.bootstrap_required);
      } catch {
        if (!cancelled) setBootstrapRequired(false);
      }

      if (getAuthToken()) {
        try {
          const user = await request<UserRead>("/auth/me");
          if (!cancelled) setCurrentUser(user);
        } catch {
          clearAuthToken();
          if (!cancelled) {
            setToken(null);
            setCurrentUser(null);
          }
        }
      } else if (!cancelled) {
        setCurrentUser(null);
      }

      if (!cancelled) setLoading(false);
    }

    loadAuthState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleAuthInvalid = () => {
      clearAuthToken();
      setToken(null);
      setCurrentUser(null);
    };

    window.addEventListener("projecttrace:auth-invalid", handleAuthInvalid);
    return () => {
      window.removeEventListener("projecttrace:auth-invalid", handleAuthInvalid);
    };
  }, []);

  async function login(email: string, password: string) {
    const response = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.access_token);
    setToken(response.access_token);
    setCurrentUser(response.user);
    setBootstrapRequired(false);
  }

  function logout() {
    clearAuthToken();
    setToken(null);
    setCurrentUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      token,
      bootstrapRequired,
      loading,
      isAdmin: currentUser?.role === "ADMIN",
      login,
      logout,
      refreshCurrentUser,
    }),
    [bootstrapRequired, currentUser, loading, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
