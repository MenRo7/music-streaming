import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import MediaPage from './MediaPage';
import { getAlbumById, Album } from '../apis/AlbumService';
import { usePlayer, Track } from '../apis/PlayerContext';

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
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCollectionContext, playSong } = usePlayer();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getAlbumById(id);
        if (!cancelled) setAlbum(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Impossible de charger cet album.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

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

  const onFirstPlay = () => {
    const first = mediaSongs[0];
    if (!first) return;
    setCollectionContext({ type: 'album', id: Number(id) }, mediaSongs);
    playSong(first.audio, first.name, first.artist, first.album_image || '', first.id, {
      playlistIds: first.playlistIds,
    });
  };

  return (
    <MediaPage
      title={album.title}
      artist={album.artist_name || 'Artiste inconnu'}
      image={album.image || ''}
      songs={mediaSongs}
      collectionType="album"
      collectionId={Number(id)}
    />
  );
};

export default AlbumPage;
