import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <>
      <div className='sidebar'>
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
      </div>
    </>
  );
};

export default Sidebar;
