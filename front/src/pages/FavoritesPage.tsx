import React, { useEffect, useState } from 'react';
import { getFavorites, removeFavorite } from '../apis/FavoritesService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { usePlayer } from '../apis/PlayerContext';
import SongList, { UISong } from '../components/SongList';

const toNumberArray = (arr: any[]): number[] =>
  (Array.isArray(arr) ? arr : []).map(Number).filter(Number.isFinite);

const FavoritesPage: React.FC = () => {
  const { addToQueue } = usePlayer();
  const [songs, setSongs] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const raw = await getFavorites();

        const formatted: UISong[] = (raw as any[]).map((m: any) => ({
          id: Number(m.id ?? m.music_id ?? m.song_id),
          name: m.name ?? m.title ?? 'Sans titre',
          artist: m.artist ?? m.artist_name ?? 'Inconnu',
          album: m.album ?? m.album_title ?? (m.album?.title ?? 'Inconnu'),
          album_image: m.album_image ?? m.image ?? (m.album?.image ?? ''),
          audio: m.audio ?? m.stream_url ?? '',
          dateAdded: m.date_added ?? m.favorited_at ?? m.created_at ?? '',
          duration: m.duration ?? undefined,
          playlistIds: toNumberArray(m.playlist_ids ?? m.playlists ?? []),
        })).filter(s => Number.isFinite(s.id) && !!s.audio);

        setSongs(formatted);
      } catch (e) {
        console.error('Erreur chargement favoris:', e);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleTogglePlaylist = async (
    playlistId: number | string, checked: boolean, songId: number | string
  ) => {
    const pid = Number(playlistId);
    const sid = Number(songId);
    if (!Number.isFinite(pid) || !Number.isFinite(sid)) return;
    if (checked) await addMusicToPlaylist(pid, sid);
    else await removeMusicFromPlaylist(pid, sid);
  };

  if (loading) {
    return (
      <div className="media-content">
        <div style={{ padding: 24 }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className="media-content">
      <div className="media-page">
        <h2>Titres favoris</h2>

        <SongList
          songs={songs}
          showAlbum
          showArtist
          showDateAdded
          showDuration={false}
          getActions={(song) => [
            { label: 'Ajouter à la file d’attente', onClick: () => addToQueue(song) },
            {
              label: 'Ajouter à une playlist',
              onClick: () => {},
              withPlaylistMenu: true,
              songId: song.id,
              existingPlaylistIds: song.playlistIds ?? [],
              onToggle: (playlistId, checked) => handleTogglePlaylist(playlistId, checked, song.id),
            },
            {
              label: 'Retirer des favoris',
              onClick: async () => {
                await removeFavorite(song.id);
                setSongs(prev => prev.filter(s => s.id !== song.id));
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FavoritesPage;
