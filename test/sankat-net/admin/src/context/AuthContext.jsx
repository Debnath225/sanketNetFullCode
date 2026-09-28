import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { post, get, setAccessToken, clearAccessToken, unwrap } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = unwrap(await get("/auth/me"));
      // Only allow admin and operator roles in the admin panel
      if (data && (data.role === "admin" || data.role === "operator")) {
        setUser(data);
      } else if (data) {
        // Valid user but not admin — clear token and reject
        clearAccessToken();
        setUser(null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) throw new Error("Email and password are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");

    const data = unwrap(await post("/auth/login", { email: email.trim().toLowerCase(), password }));
    if (!data?.accessToken) throw new Error("Login failed: no token received");

    if (data.user?.role !== "admin" && data.user?.role !== "operator") {
      throw new Error("Access denied: admin privileges required");
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await post("/auth/logout"); } catch { /* ignore */ }
    clearAccessToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
