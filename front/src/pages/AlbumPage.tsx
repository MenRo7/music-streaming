// src/pages/AlbumPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MediaPage from './MediaPage';
import { getAlbumById, Album } from '../apis/AlbumService';
import { usePlayer, Track } from '../apis/PlayerContext';
import { useUser } from '../apis/UserContext';

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

  const { setCollectionContext, playSong } = usePlayer();

  let currentUserId: number | undefined = undefined;
  try {
    // @ts-ignore selon ton implémentation
    const userCtx = useUser?.();
    currentUserId = userCtx?.user?.id;
  } catch {}

  const canEdit =
    Boolean(album?.user_id) &&
    Boolean(currentUserId) &&
    Number(album!.user_id) === Number(currentUserId);

  const fetchAlbum = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAlbumById(id);
      setAlbum(data);
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
      // ⬇️ Redirection vers la page d'édition
      onEdit={canEdit ? () => navigate(`/album/${id}/edit`) : undefined}
    />
  );
};

export default AlbumPage;
