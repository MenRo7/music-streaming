import React, { createContext, useState } from 'react';
import axios from 'axios';
import { API_URL } from './api';
import { loginRequest, verify2fa } from './AuthService';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<'ok' | '2fa_required' | 'verification_required'>;
  confirm2fa: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => 'ok',
  confirm2fa: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    const status = res.data?.status;
    if (status === 'verification_required') return 'verification_required';
    if (status === '2fa_required') return '2fa_required';
    return 'ok';
  };

  const confirm2fa = async (email: string, code: string) => {
    const res = await verify2fa(email, code);
    const t = res.data.token;
    localStorage.setItem('authToken', t);
    setToken(t);
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    window.dispatchEvent(new Event('auth:changed'));
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    window.dispatchEvent(new Event('auth:changed'));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, confirm2fa, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
