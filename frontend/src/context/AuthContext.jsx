import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optional: You can decode token if needed
      setUser(JSON.parse(localStorage.getItem("user")));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    if (rememberMe) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
