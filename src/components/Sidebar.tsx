import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PlaylistCard from './PlaylistCard';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <>
      <div className="sidebar">
        <nav className="nav">
          <ul className="pill-container">
            <li>
              <button className="link-button">Mes Playlists</button>
            </li>
            <li>
              <button className="link-button">Historique</button>
            </li>
            <li>
              <button className="link-button">
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
    </>
  );
};

export default Sidebar;
