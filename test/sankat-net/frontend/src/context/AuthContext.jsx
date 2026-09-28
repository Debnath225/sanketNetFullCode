/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import authApi from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try { setUser(await authApi.getMe()); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async payload => {
    const data = await authApi.login(payload);
    setUser(data?.user || data);
    return data;
  }, []);
  const register = useCallback(async payload => {
    const data = await authApi.register(payload);
    setUser(data?.user || data);
    return data;
  }, []);
  const logout = useCallback(async () => { await authApi.logout(); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: loadUser }}>
    {children}
  </AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
