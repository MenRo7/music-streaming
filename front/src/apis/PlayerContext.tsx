import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PlayerContextType {
  audioUrl: string;
  title: string;
  artist: string;
  albumImage: string;
  playSong: (url: string, title: string, artist: string, album_image: string) => void;
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

  const playSong = (url: string, title: string, artist: string, album_image: string) => {
    setAudioUrl(url);
    setTitle(title);
    setArtist(artist);
    setAlbumImage(album_image);
  };

  return (
    <PlayerContext.Provider
      value={{ audioUrl, title, artist, albumImage, playSong }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
