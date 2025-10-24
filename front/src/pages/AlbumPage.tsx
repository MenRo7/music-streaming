import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MediaPage from './MediaPage';
import { getAlbumById, Album, likeAlbum, unlikeAlbum } from '../apis/AlbumService';
import { usePlayer, Track } from '../contexts/PlayerContext';
import { useUser } from '../contexts/UserContext';
import SEOHead from '../components/SEOHead';

import { addFavorite, removeFavorite, getFavorites } from '../apis/FavoritesService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import PlaylistCheckboxMenu from '../components/PlaylistCheckboxMenu';

const extractPlaylistIds = (val: any): number[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => (x && typeof x === 'object' ? x.id : x))
    .map(Number)
    .filter(Number.isFinite);
};

const toDurationStr = (v?: string | number | null) => {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  const sec = Math.max(0, Math.floor(v));
  const mm = Math.floor(sec / 60).toString().padStart(2, '0');
  const ss = (sec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const AlbumPage: React.FC = () => {
  const { t } = useTranslation();
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
      setError(t('album.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { fetchAlbum(); }, [fetchAlbum]);

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
        console.error(t('album.errorLoadingFavorites'), e);
      }
    })();
  }, [t]);

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

  const songs: (Track & { dateAdded?: string; playlistIds?: number[]; artist_user_id?: number; album_id?: number })[] =
    useMemo(() => {
      if (!album?.musics) return [];
      return album.musics.map((m) => ({
        id: m.id,
        name: m.title,
        artist: m.artist_name || album.artist_name || t('album.unknown'),
        album: album.title,
        album_image: album.image || undefined,
        audio: m.audio || '',
        duration: m.duration,
        playlistIds: extractPlaylistIds((m as any).playlist_ids ?? (m as any).playlists ?? (m as any).playlistIds ?? []),
        dateAdded: album.created_at || '',
        artist_user_id: m.artist_user_id ?? (album.user_id ? Number(album.user_id) : undefined),
        album_id: m.album_id ?? (album.id ? Number(album.id) : undefined),
      }));
    }, [album, t]);

  const totalDuration = useMemo(() => {
    if (!album?.musics) return '0:00';
    const totalSeconds = album.musics.reduce((acc, m) => {
      const dur = m.duration;
      if (typeof dur === 'number') return acc + dur;
      if (typeof dur === 'string') {
        const parts = dur.split(':');
        if (parts.length === 2) {
          return acc + (parseInt(parts[0]) * 60) + parseInt(parts[1]);
        }
      }
      return acc;
    }, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [album]);

  const toggleLike = async () => {
    try {
      if (liked) await unlikeAlbum(Number(id));
      else await likeAlbum(Number(id));
      setLiked(!liked);
    } catch (e) {
      console.error(t('album.errorLike'), e);
    }
  };

  const headerMenuItems = useMemo(() => {
    if (!songs.length) return [];

    const addAllToQueue = () => songs.forEach((s) => addToQueue(s));

    const onToggleBulkPlaylist = async (playlistId: number, checked: boolean) => {
      try {
        if (checked) {
          await Promise.allSettled(
            songs.map((s) => addMusicToPlaylist(Number(playlistId), Number(s.id)))
          );
        } else {
          await Promise.allSettled(
            songs.map((s) => removeMusicFromPlaylist(Number(playlistId), Number(s.id)))
          );
        }
      } catch (e) {
        console.error(t('album.errorBulkPlaylist'), e);
      }
    };

    const addAllToFavorites = async () => {
      try {
        await Promise.allSettled(songs.map((s) => addFavorite(Number(s.id))));
      } catch (e) {
        console.error(t('album.errorAddingFavorites'), e);
      }
    };

    return [
      { label: t('mediaPage.addToQueue'), onClick: addAllToQueue },
      {
        label: t('music.addToPlaylist'),
        onClick: () => {},
        submenuContent: (
          <PlaylistCheckboxMenu
            existingPlaylistIds={[]}
            onToggle={(pid, checked) => onToggleBulkPlaylist(Number(pid), checked)}
          />
        ),
      },
      { label: t('mediaPage.addToFavorites'), onClick: addAllToFavorites },
    ];
  }, [songs, addToQueue, t]);

  if (loading) {
    return (
      <div className="media-content">
        <div style={{ padding: 24 }}>{t('album.loading')}</div>
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
        <div style={{ padding: 24 }}>{t('album.notFound')}</div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${album.title} - ${album.artist_name || t('album.unknownArtist')} | Rhapsody`}
        description={`Écoutez l'album ${album.title} de ${album.artist_name || t('album.unknownArtist')} sur Rhapsody. ${songs.length} morceaux disponibles en streaming.`}
        type="music.album"
        image={album.image || undefined}
        structuredData={{
          '@type': 'MusicAlbum',
          name: album.title,
          byArtist: {
            '@type': 'MusicGroup',
            name: album.artist_name || t('album.unknownArtist'),
          },
          numTracks: songs.length,
          image: album.image || undefined,
        }}
      />
      <MediaPage
        title={album.title}
        artist={album.artist_name || t('album.unknownArtist')}
        image={album.image || ''}
        songs={songs}
        collectionType="album"
        collectionId={Number(id)}
      releaseYear={(album as any).release_year}
      trackCount={songs.length}
      totalDuration={totalDuration}
      onEdit={canEdit ? () => navigate(`/album/${id}/edit`) : undefined}
      isLiked={!canEdit ? liked : undefined}
      onToggleLike={!canEdit ? toggleLike : undefined}
      headerMenuItems={headerMenuItems}
      getActions={(song) => {
        const baseline = Array.from(new Set(song.playlistIds ?? [])) as number[];
        return [
          {
            label: isFavorite(song.id) ? t('mediaPage.removeFromFavorites') : t('mediaPage.addToFavorites'),
            onClick: async () => {
              try {
                if (isFavorite(song.id)) await removeFromFavorites(song.id);
                else await addToFavorites(song.id);
              } catch (e) {
                console.error(t('album.errorUpdatingFavorites'), e);
              }
            },
          },
          {
            label: t('music.addToPlaylist'),
            onClick: () => {},
            withPlaylistMenu: true,
            songId: song.id,
            existingPlaylistIds: baseline,
            onToggle: async (playlistId: number, checked: boolean) => {
              try {
                if (checked) await addMusicToPlaylist(playlistId, song.id);
                else await removeMusicFromPlaylist(playlistId, song.id);
              } catch (e) {
                console.error(t('album.errorUpdatingPlaylist'), e);
              }
            },
          },
          { label: t('mediaPage.addToQueue'), onClick: () => addToQueue(song) },
        ];
      }}
      onArtistClick={() => {
        if (album.user_id) navigate(`/profile?user=${album.user_id}`);
      }}
    />
    </>
  );
};

export default AlbumPage;
