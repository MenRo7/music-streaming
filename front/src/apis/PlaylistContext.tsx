import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const fetchPlaylists = useCallback(async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des playlists :', error);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return (
    <PlaylistContext.Provider value={{ playlists, fetchPlaylists }}>
      {children}
    </PlaylistContext.Provider>
  );
};
