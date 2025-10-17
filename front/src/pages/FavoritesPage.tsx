import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFavorites, removeFavorite } from '../apis/FavoritesService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { usePlayer, Track } from '../apis/PlayerContext';
import MediaPage from './MediaPage';
import PlaylistCheckboxMenu from '../components/PlaylistCheckboxMenu';
import { UISong } from '../components/SongList';

const cover = '/favorites-cover.svg';

const extractPlaylistIds = (val: any): number[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => (x && typeof x === 'object' ? x.id : x))
    .map(Number)
    .filter(Number.isFinite);
};

const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToQueue } = usePlayer();
  const [songs, setSongs] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const raw = await getFavorites();

        const formatted: UISong[] = (raw as any[]).map((m: any) =>
          ({
            id: Number(m.id),
            name: m.name ?? m.title ?? t('album.unknown'),
            artist: m.artist ?? m.artist_name ?? t('album.unknown'),
            album: m.album ?? m.album_title ?? (m.album?.title ?? t('album.unknown')),
            album_image: (m.album_image ?? m.image ?? m.album?.image ?? '') || '',
            audio: m.audio ?? m.stream_url ?? '',
            dateAdded: m.dateAdded ?? m.date_added ?? m.favorited_at ?? m.created_at ?? '',
            duration: m.duration ?? undefined,
            playlistIds: extractPlaylistIds(m.playlist_ids ?? m.playlists ?? m.playlistIds ?? []),
            ...(m.album_id != null ? { album_id: Number(m.album_id) } : {}),
            ...(m.artist_user_id != null ? { artist_user_id: Number(m.artist_user_id) } : {}),
          } as any)
        );

        setSongs(formatted);
      } catch (e) {
        console.error(t('favorites.errorLoading'), e);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const headerMenuItems = useMemo(() => {
    if (loading || songs.length === 0) return [];

    const addAllToQueue = () => {
      songs.forEach((s) => addToQueue(s as any));
    };

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

        // Mise à jour locale réactive
        setSongs((prev) =>
          prev.map((s) => {
            const cur = Array.isArray(s.playlistIds) ? s.playlistIds : [];
            const pid = Number(playlistId);
            return {
              ...s,
              playlistIds: checked
                ? Array.from(new Set([...cur, pid]))
                : cur.filter((id) => Number(id) !== pid),
            };
          })
        );
      } catch (e) {
        console.error(t('album.errorBulkPlaylist'), e);
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
    ];
  }, [loading, songs, addToQueue, t]);

  if (loading) {
    return (
      <div className="media-content">
        <div style={{ padding: 24 }}>{t('favorites.loading')}</div>
      </div>
    );
  }

  return (
    <MediaPage
      title={t('favorites.title')}
      image={cover}
      songs={songs as unknown as (Track & { dateAdded?: string; playlistIds?: number[]; album_id?: number; artist_user_id?: number })[]}
      collectionType="favorites"
      collectionId={0}
      headerMenuItems={headerMenuItems}
      onAlbumClick={(song) => {
        const s: any = song;
        if (s.album_id) navigate(`/album/${s.album_id}`);
      }}
      onArtistClick={(song) => {
        const s: any = song;
        if (s.artist_user_id) navigate(`/profile?user=${s.artist_user_id}`);
      }}
      getActions={(song) => [
        { label: t('mediaPage.addToQueue'), onClick: () => addToQueue(song as any) },
        {
          label: t('music.addToPlaylist'),
          onClick: () => {},
          withPlaylistMenu: true,
          songId: (song as any).id,
          existingPlaylistIds: (song as any).playlistIds ?? [],
          onToggle: async (playlistId: number, checked: boolean) => {
            try {
              if (checked) await addMusicToPlaylist(playlistId, (song as any).id);
              else await removeMusicFromPlaylist(playlistId, (song as any).id);

              setSongs((prev) =>
                prev.map((s) => {
                  if (s.id !== (song as any).id) return s;
                  const cur = Array.isArray(s.playlistIds) ? s.playlistIds : [];
                  const pid = Number(playlistId);
                  return {
                    ...s,
                    playlistIds: checked
                      ? Array.from(new Set([...cur, pid]))
                      : cur.filter((id) => Number(id) !== pid),
                  };
                })
              );
            } catch (e) {
              console.error(t('album.errorUpdatingPlaylist'), e);
            }
          },
        },
        {
          label: t('mediaPage.removeFromFavorites'),
          onClick: async () => {
            await removeFavorite((song as any).id);
            setSongs((prev) => prev.filter((s2) => s2.id !== (song as any).id));
          },
        },
      ]}
    />
  );
};

export default FavoritesPage;
