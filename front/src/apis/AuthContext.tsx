import React, { createContext, useState } from 'react';
import axios from 'axios';
import { API_URL } from './api';
interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem('authToken', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (err) {
      console.error('Erreur lors de la connexion', err);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/logout',
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
