import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MediaPage from './MediaPage';
import { getAlbumById, Album, likeAlbum, unlikeAlbum } from '../apis/AlbumService';
import { usePlayer, Track } from '../apis/PlayerContext';
import { useUser } from '../apis/UserContext';

import { addFavorite, removeFavorite, getFavorites } from '../apis/FavoritesService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';

const toDurationStr = (v?: string | number | null) => {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  const sec = Math.max(0, Math.floor(v));
  const mm = Math.floor(sec / 60).toString().padStart(2, '0');
  const ss = (sec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const AlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const { addToQueue } = usePlayer();
  const { user } = useUser();
  const currentUserId = user?.id;

  const canEdit =
    Boolean(album?.user_id) &&
    Boolean(currentUserId) &&
    Number(album!.user_id) === Number(currentUserId);

  // --- Favoris (état local pour les IDs favoris) ---
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const fetchAlbum = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAlbumById(id);
      setAlbum(data);
      setLiked(Boolean((data as any)?.is_liked));
    } catch (e) {
      console.error(e);
      setError('Impossible de charger cet album.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  // Charger les favoris au montage
  useEffect(() => {
    (async () => {
      try {
        const favs = await getFavorites();
        const ids = new Set<number>(
          (Array.isArray(favs) ? favs : [])
            .map((m: any) => Number(m.id))
            .filter(Number.isFinite)
        );
        setFavoriteIds(ids);
      } catch (e) {
        console.error('Erreur chargement favoris', e);
      }
    })();
  }, []);

  const isFavorite = (songId: number) => favoriteIds.has(Number(songId));
  const addToFavorites = async (songId: number) => {
    await addFavorite(songId);
    setFavoriteIds(prev => new Set(prev).add(Number(songId)));
  };
  const removeFromFavorites = async (songId: number) => {
    await removeFavorite(songId);
    setFavoriteIds(prev => {
      const s = new Set(prev);
      s.delete(Number(songId));
      return s;
    });
  };

  const mediaSongs: (Track & { dateAdded?: string; playlistIds?: number[] })[] = useMemo(() => {
    if (!album?.musics) return [];
    return album.musics.map((m) => ({
      id: m.id,
      name: m.title,
      artist: m.artist_name || album.artist_name || 'Inconnu',
      album: album.title,
      album_image: album.image || undefined,
      audio: m.audio || '',
      duration: toDurationStr(m.duration),
      playlistIds: (m.playlist_ids || []) as number[],
      dateAdded: album.created_at || '',
    }));
  }, [album]);

  const toggleLike = async () => {
    try {
      if (liked) await unlikeAlbum(Number(id));
      else await likeAlbum(Number(id));
      setLiked(!liked);
    } catch (e) {
      console.error('Erreur like/unlike album', e);
    }
  };

  if (loading) {
    return (
      <div className="media-content">
        <div style={{ padding: 24 }}>Chargement…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="media-content">
        <div style={{ padding: 24, color: '#f88' }}>{error}</div>
      </div>
    );
  }
  if (!album) {
    return (
      <div className="media-content">
        <div style={{ padding: 24 }}>Album introuvable.</div>
      </div>
    );
  }

  return (
    <MediaPage
      title={album.title}
      artist={album.artist_name || 'Artiste inconnu'}
      image={album.image || ''}
      songs={mediaSongs}
      collectionType="album"
      collectionId={Number(id)}
      onEdit={canEdit ? () => navigate(`/album/${id}/edit`) : undefined}
      isLiked={!canEdit ? liked : undefined}
      onToggleLike={!canEdit ? toggleLike : undefined}
      getActions={(song) => {
        const baseline = Array.from(new Set(song.playlistIds ?? [])) as number[];
        return [
          {
            label: isFavorite(song.id) ? 'Supprimer des favoris' : 'Ajouter aux favoris',
            onClick: async () => {
              try {
                if (isFavorite(song.id)) await removeFromFavorites(song.id);
                else await addToFavorites(song.id);
              } catch (e) {
                console.error('Maj favoris échouée', e);
              }
            },
          },
          {
            label: 'Ajouter à une playlist',
            onClick: () => {},
            withPlaylistMenu: true,
            songId: song.id,
            existingPlaylistIds: baseline,
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
        ];
      }}
      onArtistClick={() => {
        if (album.user_id) navigate(`/profile?user=${album.user_id}`);
      }}
    />
  );
};

export default AlbumPage;
