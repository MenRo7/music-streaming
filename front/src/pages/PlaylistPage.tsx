import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MediaPage from './MediaPage';
import SEOHead from '../components/SEOHead';
import {
  getPlaylistById,
  deletePlaylist,
  removeMusicFromPlaylist,
  addMusicToPlaylist,
  likePlaylist,
  unlikePlaylist,
} from '../apis/PlaylistService';
import { usePlaylists } from '../contexts/PlaylistContext';
import { addFavorite, removeFavorite, getFavorites } from '../apis/FavoritesService';
import { usePlayer } from '../contexts/PlayerContext';
import { useDialogContext } from '../contexts/DialogContext';
import CreateEditPlaylistModal from '../components/CreateEditPlaylistModal';
import { useUser } from '../contexts/UserContext';
import PlaylistCheckboxMenu from '../components/PlaylistCheckboxMenu';
import SortButton, { SortOption } from '../components/SortButton';

const extractPlaylistIds = (val: any): number[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => (x && typeof x === 'object' ? x.id : x))
    .map(Number)
    .filter(Number.isFinite);
};

const PlaylistPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchPlaylists } = usePlaylists();
  const { addToQueue } = usePlayer();
  const { user: viewer } = useUser();
  const { showToast } = useDialogContext();

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('date_added');

  const fetchPlaylist = async () => {
    if (!id) return;
    try {
      const data = await getPlaylistById(parseInt(id, 10));
      setPlaylist(data);
      setLiked(Boolean((data as any)?.is_liked));
    } catch (error) {
      console.error(t('playlistPage.errorLoading'), error);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id, t]);

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
    setFavoriteIds((prev) => new Set(prev).add(Number(songId)));
  };
  const removeFromFavorites = async (songId: number) => {
    await removeFavorite(songId);
    setFavoriteIds((prev) => {
      const s = new Set(prev);
      s.delete(Number(songId));
      return s;
    });
  };

  const canEdit = useMemo(() => {
    if (!playlist || !viewer) return false;
    return Number(playlist.user_id) === Number(viewer.id);
  }, [playlist, viewer]);

  const handleRemoveMusicFromPlaylist = async (songId: number) => {
    if (!playlist || !canEdit) return;
    try {
      await removeMusicFromPlaylist(playlist.id, songId);
      setPlaylist((prev: any) => ({
        ...prev,
        songs: prev.songs.filter((song: any) => song.id !== songId),
      }));
      showToast(t('playlistPage.successDeletingMusic'), 'success');
    } catch {
      showToast(t('playlistPage.errorDeletingMusic'), 'error');
    }
  };

  const handleEditPlaylist = () => {
    if (!canEdit) return;
    setIsModalOpen(true);
  };

  const handleDeletePlaylist = async () => {
    if (!playlist || !canEdit) return;
    try {
      await deletePlaylist(playlist.id);
      fetchPlaylists();
      navigate('/main');
    } catch (error) {
      console.error(t('playlistPage.errorDeleting'), error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchPlaylist();
    fetchPlaylists();
  };

  const toggleLike = async () => {
    try {
      if (liked) await unlikePlaylist(playlist.id);
      else await likePlaylist(playlist.id);
      setLiked(!liked);
    } catch (e) {
      console.error(t('playlistPage.errorLike'), e);
    }
  };

  const songsNormalized = useMemo(() => {
    const raw = Array.isArray(playlist?.songs) ? playlist!.songs : [];
    return raw.map((s: any) => ({
      ...s,
      playlistIds: extractPlaylistIds(s.playlistIds ?? s.playlists ?? s.playlist_ids ?? []),
    }));
  }, [playlist?.songs]);

  const songsSorted = useMemo(() => {
    const sorted = [...songsNormalized];
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
      case 'artist':
        return sorted.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
      case 'date_added':
      default:
        return sorted.sort((a, b) => {
          const dateA = a.dateAdded || a.date_added || '';
          const dateB = b.dateAdded || b.date_added || '';
          return dateB.localeCompare(dateA);
        });
    }
  }, [songsNormalized, sortBy]);

  const totalDuration = useMemo(() => {
    const raw = Array.isArray(playlist?.songs) ? playlist!.songs : [];
    if (raw.length === 0) return '0:00';
    const totalSeconds = raw.reduce((acc: number, s: any) => {
      const dur = s.duration;
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
  }, [playlist?.songs]);

  const headerMenuItems = useMemo(() => {
    const songs = songsSorted as Array<{ id: number }>;
    if (!songs.length) return [];

    const addAllToQueue = () => songs.forEach((s) => addToQueue(s as any));

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
        console.error(t('playlistPage.errorBulkPlaylist'), e);
      }
    };

    const addAllToFavorites = async () => {
      try {
        await Promise.allSettled(songs.map((s) => addFavorite(Number(s.id))));
      } catch (e) {
        console.error(t('playlistPage.errorAddingFavorites'), e);
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
  }, [songsSorted, addToQueue, t]);

  return (
    <>
      <SEOHead
        title={`${playlist?.title || 'Playlist'} | Rhapsody`}
        description={`Découvrez la playlist ${playlist?.title || 'Playlist'} sur Rhapsody. ${songsSorted.length} morceaux sélectionnés avec soin.`}
        type="music.playlist"
        image={playlist?.image || undefined}
        structuredData={{
          '@type': 'ItemList',
          name: playlist?.title,
          numberOfItems: songsSorted.length,
          itemListElement: songsSorted.slice(0, 10).map((track, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'MusicRecording',
              name: track.title,
              byArtist: {
                '@type': 'MusicGroup',
                name: track.artist || 'Unknown Artist',
              },
            },
          })),
        }}
      />
      <MediaPage
        title={playlist?.title}
        image={playlist?.image}
        songs={songsSorted}
        isPlaylist={true}
        collectionType="playlist"
        collectionId={playlist?.id}
      creatorName={playlist?.creator_name}
      trackCount={songsSorted.length}
      totalDuration={totalDuration}
      onEdit={canEdit ? handleEditPlaylist : undefined}
      onDelete={canEdit ? handleDeletePlaylist : undefined}
      isLiked={!canEdit ? liked : undefined}
      onToggleLike={!canEdit ? toggleLike : undefined}
      headerMenuItems={headerMenuItems}
      sortButton={<SortButton currentSort={sortBy} onSortChange={setSortBy} />}
      renderModal={
        canEdit ? (
          <CreateEditPlaylistModal
            isOpen={isModalOpen}
            onClose={closeModal}
            initialData={playlist}
            mode="edit"
          />
        ) : null
      }
      getActions={(song) => {
        const baseline = Array.from(
          new Set([...(song.playlistIds ?? []), ...(playlist?.id ? [Number(playlist.id)] : [])])
        ) as number[];

        const base = [
          {
            label: isFavorite(song.id) ? t('mediaPage.removeFromFavorites') : t('mediaPage.addToFavorites'),
            onClick: async () => {
              try {
                if (isFavorite(song.id)) await removeFromFavorites(song.id);
                else await addToFavorites(song.id);
              } catch (e) {
                console.error(t('playlistPage.errorUpdatingFavorites'), e);
              }
            },
          },
          {
            label: t('mediaPage.addToAnotherPlaylist'),
            onClick: () => {},
            withPlaylistMenu: true,
            songId: song.id,
            existingPlaylistIds: baseline,
            onToggle: async (playlistId: number, checked: boolean) => {
              try {
                if (checked) await addMusicToPlaylist(playlistId, song.id);
                else await removeMusicFromPlaylist(playlistId, song.id);
              } catch (e) {
                console.error(t('playlistPage.errorUpdatingPlaylist'), e);
              }
            },
          },
          { label: t('mediaPage.addToQueue'), onClick: () => addToQueue(song) },
        ];

        if (canEdit) {
          base.push({
            label: t('mediaPage.removeFromThisPlaylist'),
            onClick: () => handleRemoveMusicFromPlaylist(song.id),
          } as any);
        }

        return base;
      }}
      onAlbumClick={(song) => {
        const s: any = song;
        if (s.album_id) navigate(`/album/${s.album_id}`);
      }}
      onArtistClick={(song) => {
        const s: any = song;
        if (s.artist_user_id) navigate(`/profile?user=${s.artist_user_id}`);
      }}
    />
    </>
  );
};

export default PlaylistPage;
