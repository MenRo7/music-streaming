import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUser } from './UserService';

interface UserContextType {
  user: any;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const refreshUser = async () => {
    try {
      const res = await fetchUser();
      setUser(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement du profil :', err);
    }
  };

  useEffect(() => {
    refreshUser();
    const onAuthChanged = () => {
      const token = localStorage.getItem('authToken');
      if (token) refreshUser();
      else setUser(null);
    };
    window.addEventListener('auth:changed', onAuthChanged);
    return () => window.removeEventListener('auth:changed', onAuthChanged);
  }, []);
  

  return (
    <UserContext.Provider value={{ user, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
