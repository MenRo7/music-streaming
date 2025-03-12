import React, { createContext, useState } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password }, { withCredentials: true });
      localStorage.setItem('authToken', response.data.token);
      setUser({});
    } catch (err) {
      console.error('Erreur lors de la connexion', err);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      console.log('logout');
      await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion', err);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
