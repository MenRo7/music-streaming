import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRandom, faEllipsisH, faBars } from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from '../components/DropdownMenu';
import CreateEditPlaylistModal from '../components/CreateEditPlaylistModal';

import { getPlaylistById, deletePlaylist } from '../apis/PlaylistService';
import { usePlaylists } from '../apis/PlaylistContext';

import '../styles/PlaylistPage.css';

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

  const handleEditPlaylist = () => {
    setIsModalOpen(true);
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cette playlist ?');
    if (!confirmDelete) return;
    try {
      await deletePlaylist(playlist?.id);
      fetchPlaylists();
      navigate('/main');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const closePlaylistModal = () => {
    setIsModalOpen(false);
    fetchPlaylist();
    fetchPlaylists();
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  return (
    <div className="playlist-content">
      <div className="playlist-page">
        <div className="playlist-header">
          <img className="playlist-page-image" src={playlist?.image} alt={playlist?.title} />
          <h1>{playlist?.title}</h1>
        </div>

        <div className="playlist-controls">
          <FontAwesomeIcon icon={faPlay} className="control-icon" />
          <FontAwesomeIcon icon={faRandom} className="control-icon" />
          <DropdownMenu
            items={[
              { label: 'Modifier', onClick: handleEditPlaylist },
              { label: 'Supprimer', onClick: handleDeletePlaylist },
            ]}
            trigger={<FontAwesomeIcon icon={faEllipsisH} className="control-icon" />}
          />
          <FontAwesomeIcon icon={faBars} className="control-icon burger-menu" />
        </div>

        <table className="song-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Album</th>
              <th>Artiste</th>
              <th>Date d'ajout</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            {playlist?.songs?.map((song: any, index: number) => (
              <tr key={index}>
                <td>{song?.name}</td>
                <td>{song?.album}</td>
                <td>{song?.artist}</td>
                <td>{song?.dateAdded}</td>
                <td>{song?.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateEditPlaylistModal
        isOpen={isModalOpen}
        onClose={closePlaylistModal}
        initialData={playlist}
        mode="edit"
      />
    </div>
  );
};

export default PlaylistPage;
