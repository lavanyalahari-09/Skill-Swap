import { createContext, useContext, useState } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('skillSwapUser') || 'null'));

  const persistUser = (payload) => {
    localStorage.setItem('skillSwapUser', JSON.stringify(payload));
    setUser(payload);
  };

  const login = async (form) => {
    const { data } = await api.post('/auth/login', {
      email: form.email.trim().toLowerCase(),
      password: form.password
    });
    persistUser(data);
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase()
    });
    persistUser(data);
  };

  const updateUser = (payload) => {
    const next = { ...user, ...payload };
    persistUser(next);
  };

  const logout = () => {
    localStorage.removeItem('skillSwapUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
