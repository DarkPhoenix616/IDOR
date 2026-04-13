import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('current_user') || 'null'); }
    catch { return null; }
  });
  const [token, setToken]     = useState(() => localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    // Response shape: { token, userId, email, firstName, lastName, type }
    const jwt = data.token ?? data.jwt ?? data.accessToken ?? data.jwtToken;
    if (!jwt) throw new Error('Server did not return a token');

    localStorage.setItem('jwt_token', jwt);
    setToken(jwt);

    const userObj = {
      userId:    data.userId ?? data.id,
      email:     data.email ?? email,
      username:  data.firstName
                  ? `${data.firstName}${data.lastName ? ' ' + data.lastName : ''}`
                  : (email.split('@')[0]),
      firstName: data.firstName,
      lastName:  data.lastName,
      role:      data.role ?? 'USER',
    };

    localStorage.setItem('current_user', JSON.stringify(userObj));
    setUser(userObj);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
