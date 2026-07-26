import React, { useContext, useEffect, useState } from "react";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const getInitialUser = () => {
    try {
      const storedLocal = localStorage.getItem("cravingUser");
      if (storedLocal) return JSON.parse(storedLocal);
      const storedSession = sessionStorage.getItem("cravingUser");
      if (storedSession) return JSON.parse(storedSession);
    } catch {
      // fallback
    }
    return null;
  };

  const [user, setUser] = useState(getInitialUser());
  const [isLogin, setIsLogin] = useState(!!user);
  const [role, setRole] = useState(user?.userType || null);

  useEffect(() => {
    setIsLogin(!!user);
    setRole(user?.userType || null);
  }, [user]);

  const logout = () => {
    localStorage.removeItem("cravingUser");
    sessionStorage.removeItem("cravingUser");
    setUser(null);
    setIsLogin(false);
    setRole(null);
  };

  const value = {
    user,
    setUser,
    isLogin,
    setIsLogin,
    role,
    setRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
