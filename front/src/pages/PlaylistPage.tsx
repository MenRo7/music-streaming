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
import { addFavorite } from '../apis/FavoritesService';
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
            label: 'Ajouter aux favoris',
            onClick: () => {
              addFavorite(song.id).catch((e) => console.error('Ajout aux favoris échoué', e));
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
        if (s.artist_user_id) navigate(`/profile/${s.artist_user_id}`);
      }}
    />
  );
};

export default PlaylistPage;
