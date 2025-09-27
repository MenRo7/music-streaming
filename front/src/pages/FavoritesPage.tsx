import React, { useEffect, useMemo, useState } from 'react';
import MediaPage from './MediaPage';
import { Track } from '../apis/PlayerContext';
import { getFavorites, removeFavorite, FavoriteSong } from '../apis/FavoritesService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { usePlayer } from '../apis/PlayerContext';

const toTrack = (s: FavoriteSong): Track => ({
  id: s.id,
  name: s.title,
  artist: s.artist_name || 'Inconnu',
  album: 'Titres favoris',
  album_image: s.image || undefined,
  audio: s.audio,
  duration: s.duration,
  playlistIds: (s.playlist_ids ?? []) as number[],
  dateAdded: s.date_added ? new Date(s.date_added).toLocaleDateString() : '',
});

const FavoritesPage: React.FC = () => {
  const [songs, setSongs] = useState<FavoriteSong[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToQueue } = usePlayer();

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
      collectionType="playlist"
      collectionId={0}
      getActions={(song) => [
        {
          label: 'Ajouter à une playlist',
          onClick: () => {},
          withPlaylistMenu: true,
          songId: song.id,
          existingPlaylistIds: song.playlistIds ?? [],
          onToggle: async (playlistId: number, checked: boolean) => {
            try {
              if (checked) await addMusicToPlaylist(playlistId, song.id);
              else await removeMusicFromPlaylist(playlistId, song.id);
            } catch (e) {
              console.error('Maj playlist échouée', e);
            }
          },
        },
        { label: 'Ajouter à la file d’attente', onClick: () => addToQueue(song) },
        {
          label: 'Retirer des favoris',
          onClick: () => {
            removeFavorite(song.id)
              .then(() => setSongs(prev => prev.filter(s => s.id !== song.id)))
              .catch((e) => console.error('Suppression des favoris échouée', e));
          },
        },
      ]}
    />
  );
};

export default FavoritesPage;
