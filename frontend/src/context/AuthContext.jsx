import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. On page load, try to get the user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // 2. Also get the token from localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (loginData) => {
    // 3. On login, save BOTH the token and the user object to localStorage
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user)); // Convert user object to string to save it
    setToken(loginData.token);
    setUser(loginData.user);
  };

  const logout = () => {
    // 4. On logout, remove BOTH from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // We don't need the complex useEffect hook anymore!

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};