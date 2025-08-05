import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PlayerContextType {
  audioUrl: string;
  title: string;
  artist: string;
  albumImage: string;
  currentTrackId: number | null;
  isPlaying: boolean;
  playSong: (url: string, title: string, artist: string, albumImage: string, trackId?: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [albumImage, setAlbumImage] = useState('');
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (url: string, title: string, artist: string, albumImage: string, trackId?: number) => {
    setAudioUrl(url);
    setTitle(title);
    setArtist(artist);
    setAlbumImage(albumImage);
    setCurrentTrackId(trackId || null);
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider
      value={{
        audioUrl,
        title,
        artist,
        albumImage,
        currentTrackId,
        isPlaying,
        playSong,
        setIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
