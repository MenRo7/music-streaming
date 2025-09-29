import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MediaPage from './MediaPage';
import {
  getPlaylistById,
  deletePlaylist,
  removeMusicFromPlaylist,
  addMusicToPlaylist,
  likePlaylist,
  unlikePlaylist,
} from '../apis/PlaylistService';
import { usePlaylists } from '../apis/PlaylistContext';
import { addFavorite, removeFavorite, getFavorites } from '../apis/FavoritesService';
import { usePlayer } from '../apis/PlayerContext';
import CreateEditPlaylistModal from '../components/CreateEditPlaylistModal';
import { useUser } from '../apis/UserContext';

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchPlaylists } = usePlaylists();
  const { addToQueue } = usePlayer();
  const { user: viewer } = useUser();

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  // --- Favoris (état local pour les IDs favoris) ---
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const fetchPlaylist = async () => {
    if (!id) return;
    try {
      const data = await getPlaylistById(parseInt(id, 10));
      setPlaylist(data);
      setLiked(Boolean((data as any)?.is_liked));
    } catch (error) {
      console.error('Erreur de chargement de la playlist:', error);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

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

  const isOwner = useMemo(() => {
    if (!playlist || !viewer) return false;
    return Number(playlist.user_id) === Number(viewer.id);
  }, [playlist, viewer]);

  const handleRemoveMusicFromPlaylist = async (songId: number) => {
    if (!playlist || !isOwner) return;
    try {
      await removeMusicFromPlaylist(playlist.id, songId);
      setPlaylist((prev: any) => ({
        ...prev,
        songs: prev.songs.filter((song: any) => song.id !== songId),
      }));
    } catch {
      alert('Erreur lors de la suppression de la musique de la playlist.');
    }
  };

  const handleEditPlaylist = () => {
    if (!isOwner) return;
    setIsModalOpen(true);
  };

  const handleDeletePlaylist = async () => {
    if (!playlist || !isOwner) return;
    try {
      await deletePlaylist(playlist.id);
      fetchPlaylists();
      navigate('/main');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
      console.error('Erreur like/unlike playlist', e);
    }
  };

  return (
    <MediaPage
      title={playlist?.title}
      image={playlist?.image}
      songs={playlist?.songs || []}
      isPlaylist={true}
      collectionType="playlist"
      collectionId={playlist?.id}
      onEdit={isOwner ? handleEditPlaylist : undefined}
      onDelete={isOwner ? handleDeletePlaylist : undefined}
      isLiked={!isOwner ? liked : undefined}
      onToggleLike={!isOwner ? toggleLike : undefined}
      renderModal={
        isOwner ? (
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
            label: 'Ajouter à une autre playlist',
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

        if (isOwner) {
          base.push({
            label: 'Supprimer de cette playlist',
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
  );
};

export default PlaylistPage;
