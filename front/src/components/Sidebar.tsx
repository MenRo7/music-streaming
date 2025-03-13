import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import PlaylistCard from './PlaylistCard';
import '../styles/Sidebar.css';

import { playlists } from '../utils/constants';

const Sidebar: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

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

  const resetFilters = () => {
    setActiveFilters(new Set());
  };

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
              Mes Playlists
            </button>
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('history') ? 'active' : ''}`}
              onClick={() => handleFilterClick('history')}
            >
              Historique
            </button>
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('create') ? 'active' : ''}`}
              onClick={() => handleFilterClick('create')}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </li>
        </ul>
      </nav>

      <div className="playlist-grid">
        {playlists.map((playlist) => (
          <Link key={playlist.id} to={`/playlist/${playlist.id}`}>
            <PlaylistCard title={playlist.title} imageUrl={playlist.imageUrl || '/default-image.png'} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
