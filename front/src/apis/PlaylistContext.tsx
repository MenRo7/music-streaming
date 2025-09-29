import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import debounce from 'lodash.debounce';
import { getPlaylists } from '../apis/PlaylistService';

interface PlaylistContextType {
  playlists: any[];
  fetchPlaylists: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylists = (): PlaylistContextType => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
};

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<any[]>([]);

  const doFetchPlaylists = useCallback(async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des playlists :', error);
      setPlaylists([]);
    }
  }, []);

  const debouncedFetch = useMemo(
    () =>
      debounce(() => {
        void doFetchPlaylists();
      }, 200),
    [doFetchPlaylists]
  );

  const fetchPlaylists = useCallback(async () => {
    debouncedFetch();
  }, [debouncedFetch]);

  useEffect(() => {
    void doFetchPlaylists();
    return () => {
      debouncedFetch.cancel();
    };
  }, [doFetchPlaylists, debouncedFetch]);

  useEffect(() => {
    const onUserLoaded = () => {
      setPlaylists([]);
      void fetchPlaylists();
    };

    const onAuthChanged = () => {
      setPlaylists([]);
      void fetchPlaylists();
    };

    const onLibChanged = () => {
      void fetchPlaylists();
    };

    window.addEventListener('user:loaded', onUserLoaded);
    window.addEventListener('auth:changed', onAuthChanged);
    window.addEventListener('library:changed', onLibChanged);
    window.addEventListener('playlists:changed', onLibChanged);

    return () => {
      window.removeEventListener('user:loaded', onUserLoaded);
      window.removeEventListener('auth:changed', onAuthChanged);
      window.removeEventListener('library:changed', onLibChanged);
      window.removeEventListener('playlists:changed', onLibChanged);
    };
  }, [fetchPlaylists]);

  return (
    <PlaylistContext.Provider value={{ playlists, fetchPlaylists }}>
      {children}
    </PlaylistContext.Provider>
  );
};
