import React, { useEffect, useMemo, useState } from 'react';
import MediaPage from './MediaPage';
import { Track } from '../apis/PlayerContext';
import { getFavorites, removeFavorite, FavoriteSong } from '../apis/FavoritesService';

const toTrack = (s: FavoriteSong): Track => ({
  id: s.id,
  name: s.title,
  artist: s.artist_name || 'Inconnu',
  album: 'Titres favoris',
  album_image: s.image || undefined,
  audio: s.audio,
  duration: s.duration,
  playlistIds: (s.playlist_ids ?? []) as number[],
});

const FavoritesPage: React.FC = () => {
  const [songs, setSongs] = useState<FavoriteSong[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setSongs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const mediaSongs = useMemo(() => songs.map(toTrack), [songs]);

  if (loading) {
    return <div className="media-content"><div style={{ padding: 24 }}>Chargement…</div></div>;
  }

  return (
    <MediaPage
      title="Titres favoris"
      image="/favorites-cover.svg"
      songs={mediaSongs}
      getActions={(song) => [
        {
          label: 'Retirer des favoris',
          onClick: async () => {
            await removeFavorite(song.id);
            setSongs(prev => prev.filter(s => s.id !== song.id));
          },
        },
      ]}
    />
  );
};

export default FavoritesPage;
