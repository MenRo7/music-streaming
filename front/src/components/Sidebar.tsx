import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { usePlaylists } from '../apis/PlaylistContext';

import PlaylistCard from './PlaylistCard';
import CreateEditPlaylistModal from './CreateEditPlaylistModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const { playlists, fetchPlaylists } = usePlaylists();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);

  const handleFilterClick = (filter: string) => {
    setActiveFilters((prevFilters) => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  const resetFilters = () => setActiveFilters(new Set());

  const openPlaylistModal = () => {
    setEditingPlaylist(null);
    setShowModal(true);
  };

  const closePlaylistModal = () => {
    setShowModal(false);
    fetchPlaylists();
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="sidebar">
      <nav className="nav">
        <ul className="pill-container">
          <li>
            {activeFilters.size > 0 && (
              <div className="reset-filters" onClick={resetFilters}>
                <FontAwesomeIcon icon={faTimes} className="filter-clear-icon" />
              </div>
            )}
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('playlists') ? 'active' : ''}`}
              onClick={() => handleFilterClick('playlists')}
            >
              Playlists
            </button>
          </li>
          <li>
            <Link to="/my-music">
              <button
                className={`link-button ${location.pathname === '/my-music' ? 'active' : ''}`}
              >
                Ma musique
              </button>
            </Link>
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('create') ? 'active' : ''}`}
              onClick={() => {
                handleFilterClick('create');
                openPlaylistModal();
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </li>
        </ul>
      </nav>

      <div className="playlist-grid">
        {playlists.map((playlist: any) => (
          <Link key={playlist.id} to={`/playlist/${playlist.id}`}>
            <PlaylistCard title={playlist.title} image={playlist.image} />
          </Link>
        ))}
      </div>

      <CreateEditPlaylistModal
        isOpen={showModal}
        onClose={closePlaylistModal}
        initialData={editingPlaylist || { title: '', image: '' }}
        mode={editingPlaylist ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Sidebar;
