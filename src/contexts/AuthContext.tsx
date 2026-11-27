import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { authService, profileService } from "@/services";
import type { UserProfile } from "@/services/profile";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, turnstileToken: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string, turnstileToken: string) => Promise<{ is_new_user: boolean }>;
  logout: () => Promise<void>;
  clearLocalSession: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const localSessionVersion = useRef(0);

  const clearLocalSession = useCallback(() => {
    localSessionVersion.current += 1;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("polar-reconciled");
    setUser(null);
  }, []);

  // Temporary dev bypass — remove once DB integration is live
  const DEV_BYPASS_TOKEN = "dev-bypass-token";
  const DEV_USER: UserProfile = {
    id: "dev-admin",
    name: "Admin",
    email: "admin@divlynx.com",
    role: "admin",
    phone: null,
    location: null,
    linkedin_url: null,
    portfolio_url: null,
    credits_remaining: 999,
  };

  const refreshUser = useCallback(async () => {
    const version = localSessionVersion.current;
    if (localStorage.getItem("accessToken") === DEV_BYPASS_TOKEN) {
      setUser(DEV_USER);
      return;
    }
    try {
      const profile = await profileService.getMe();
      if (version === localSessionVersion.current) setUser(profile);
    } catch {
      if (version === localSessionVersion.current) setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string, turnstileToken: string) => {
    const { access_token, refresh_token } = await authService.login(email, password, turnstileToken);
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    try {
      const profile = await profileService.getMe();
      setUser(profile);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const { access_token, refresh_token } = await authService.signup(name, email, password);
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    await refreshUser();
  };

  const googleLogin = async (credential: string, turnstileToken: string) => {
    const { access_token, refresh_token, is_new_user } = await authService.googleAuth(credential, turnstileToken);
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    try {
      const profile = await profileService.getMe();
      setUser(profile);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      throw error;
    }
    return { is_new_user: !!is_new_user };
  };

  const logout = async () => {
    try {
      await authService.logoutAll();
    } catch {
      // ignore – still clear local state
    }
    clearLocalSession();
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, signup, googleLogin, logout, clearLocalSession, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
