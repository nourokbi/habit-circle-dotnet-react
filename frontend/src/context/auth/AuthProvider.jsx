/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hc_user");
    const token = localStorage.getItem("hc_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("hc_token", data.token);
    localStorage.setItem(
      "hc_user",
      JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
      }),
    );
    setUser({ id: data.userId, username: data.username, email: data.email });
  };

  const register = useCallback(async ({ username, email, password }) => {
    const { data } = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    saveSession(data);
    return data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveSession(data);
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (googleToken) => {
    // TODO: wire up Google OAuth endpoint when backend is ready
    const { data } = await api.post("/auth/google", { token: googleToken });
    saveSession(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hc_token");
    localStorage.removeItem("hc_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
