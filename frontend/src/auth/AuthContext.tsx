import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiClient, clearToken, getToken, setToken } from "../lib/apiClient";
import type { User, UserRole } from "../types";

interface SeekerSignup {
  email: string;
  password: string;
  full_name: string;
}

interface EmployerSignup {
  email: string;
  password: string;
  company_name: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerSeeker: (data: SeekerSignup) => Promise<void>;
  registerEmployer: (data: EmployerSignup) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load if a token is present.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<User> {
    // The backend uses the OAuth2 password flow: form-encoded, email in `username`.
    const form = new URLSearchParams({ username: email, password });
    const { data } = await apiClient.post<{ access_token: string }>("/auth/login", form);
    setToken(data.access_token);
    const me = await fetchMe();
    setUser(me);
    return me;
  }

  async function registerSeeker(data: SeekerSignup) {
    await apiClient.post("/auth/register/seeker", data);
    await login(data.email, data.password);
  }

  async function registerEmployer(data: EmployerSignup) {
    await apiClient.post("/auth/register/employer", data);
    await login(data.email, data.password);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, registerSeeker, registerEmployer, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export type { UserRole };
