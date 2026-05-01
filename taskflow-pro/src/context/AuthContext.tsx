import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

/* =========================
   TYPES
========================= */
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
}

/* =========================
   CONTEXT
========================= */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   HELPERS
========================= */
const normalizeUser = (user: any): User => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/* =========================
   PROVIDER
========================= */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOGOUT
  ========================= */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  /* =========================
     INIT AUTH
  ========================= */
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      const normalizedUser = normalizeUser(response.data.data);

      setUser(normalizedUser);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /* =========================
     LOGIN
  ========================= */
  const login = async (credentials: any): Promise<User> => {
    try {
      const response = await authService.login(credentials);

      const token = response.data.data.accessToken;
      localStorage.setItem("token", token);

      const meRes = await authService.getMe();
      const normalizedUser = normalizeUser(meRes.data.data);

      setUser(normalizedUser);

      toast.success(`Welcome back, ${normalizedUser.name}!`);

      return normalizedUser;
    } catch (error) {
      throw error;
    }
  };

  /* =========================
     REGISTER
  ========================= */
  const register = async (data: any): Promise<User> => {
    try {
      const response = await authService.register(data);

      const token = response.data.data.accessToken;
      localStorage.setItem("token", token);

      const meRes = await authService.getMe();
      const normalizedUser = normalizeUser(meRes.data.data);

      setUser(normalizedUser);

      toast.success("Account created successfully!");

      return normalizedUser;
    } catch (error) {
      throw error;
    }
  };

  /* =========================
     PROVIDER VALUE
  ========================= */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
