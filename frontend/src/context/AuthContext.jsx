import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await api.post('/auth/refresh');
        setUser(res.data.user);
      } catch (_) {
        setUser(null);
      }
    };
    refresh();
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};
