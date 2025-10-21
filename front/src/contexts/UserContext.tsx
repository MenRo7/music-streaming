import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import debounce from 'lodash.debounce';
import { fetchUser } from '../apis/UserService';

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

  const doRefreshUser = useCallback(async () => {
    try {
      const res = await fetchUser();
      setUser(res.data);

      if (res?.data?.id != null) {
        localStorage.setItem('currentUserId', String(res.data.id));
        window.dispatchEvent(new CustomEvent('user:loaded', { detail: { userId: res.data.id } }));
      }
    } catch (err) {
      console.error('Erreur lors du chargement du profil :', err);
      setUser(null);
      localStorage.removeItem('currentUserId');
      window.dispatchEvent(new CustomEvent('user:loaded', { detail: { userId: null } }));
    }
  }, []);

  const debouncedRefresh = useMemo(
    () =>
      debounce(() => {
        void doRefreshUser();
      }, 200),
    [doRefreshUser]
  );

  const refreshUser = useCallback(async () => {
    debouncedRefresh();
  }, [debouncedRefresh]);

  useEffect(() => {
    void doRefreshUser();
    return () => {
      debouncedRefresh.cancel();
    };
  }, [doRefreshUser, debouncedRefresh]);

  useEffect(() => {
    const onAuthChanged = () => {
      const token = localStorage.getItem('authToken');

      setUser(null);

      if (token) {
        void refreshUser();
      } else {
        localStorage.removeItem('currentUserId');
        window.dispatchEvent(new CustomEvent('user:loaded', { detail: { userId: null } }));
      }
    };

    window.addEventListener('auth:changed', onAuthChanged);
    return () => window.removeEventListener('auth:changed', onAuthChanged);
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
