import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MediaPage from './MediaPage';
import {
  getPlaylistById,
  deletePlaylist,
  removeMusicFromPlaylist,
} from '../apis/PlaylistService';
import { usePlaylists } from '../apis/PlaylistContext';
import CreateEditPlaylistModal from '../components/CreateEditPlaylistModal';

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchPlaylists } = usePlaylists();

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlaylist = async () => {
    if (!id) return;
    try {
      const data = await getPlaylistById(parseInt(id, 10));
      setPlaylist(data);
    } catch (error) {
      console.error('Erreur de chargement de la playlist:', error);
    }
  };

  const handleRemoveMusicFromPlaylist = async (songId: number) => {
    if (!playlist) return;
    try {
      await removeMusicFromPlaylist(playlist.id, songId);
      setPlaylist((prev: any) => ({
        ...prev,
        songs: prev.songs.filter((song: any) => song.id !== songId),
      }));
    } catch (error) {
      alert("Erreur lors de la suppression de la musique de la playlist.");
    }
  };

  const handleEditPlaylist = () => setIsModalOpen(true);

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cette playlist ?');
    if (!confirmDelete) return;
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

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  return (
    <MediaPage
      title={playlist?.title}
      image={playlist?.image}
      songs={playlist?.songs || []}
      isPlaylist={true}
      onEdit={handleEditPlaylist}
      onDelete={handleDeletePlaylist}
      renderModal={
        <CreateEditPlaylistModal
          isOpen={isModalOpen}
          onClose={closeModal}
          initialData={playlist}
          mode="edit"
        />
      }
      getActions={(song) => [
        {
          label: 'Supprimer de cette playlist',
          onClick: () => handleRemoveMusicFromPlaylist(song.id),
        },
      ]}
    />
  );
};

export default PlaylistPage;
