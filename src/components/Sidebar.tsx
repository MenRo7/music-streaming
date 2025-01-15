import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import PlaylistCard from './PlaylistCard';
import '../styles/Sidebar.css';

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
        <PlaylistCard title="Playlist 1" imageUrl="wilted.png" />
        <PlaylistCard title="Playlist 2" imageUrl="krnge.png" />
        <PlaylistCard title="Playlist 3" imageUrl="punk.png" />
        <PlaylistCard title="Playlist 4" />
      </div>
    </div>
  );
};

export default Sidebar;
