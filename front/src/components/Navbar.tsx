import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../apis/AuthContext';
import { useUser } from '../apis/UserContext';

import DropdownMenu from './DropdownMenu';
import GlobalSearchBar from './GlobalSearchBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUpload, faMusic } from '@fortawesome/free-solid-svg-icons'; // ⬅️ + faMusic

import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('currentUserId');
      window.dispatchEvent(
        new CustomEvent('auth:changed', { detail: { status: 'logout' } })
      );
      setUser(null);
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  const avatarVersion = (currentUser?.updated_at && Date.parse(currentUser.updated_at))
    || (currentUser?.id ? `uid-${currentUser.id}` : 'guest');
  const avatarSrc = currentUser?.profile_image
    ? `${currentUser.profile_image}?t=${avatarVersion}`
    : '/default-avatar.png';

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <img src="/logo.png" alt="logo" className="navbar-logo" />
        <GlobalSearchBar />
        <ul>
          <li>
            <Link to="/main" aria-label="Accueil" title="Accueil">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>

          <li>
            <Link to="/my-music" aria-label="Ma musique" title="Ma musique">
              <FontAwesomeIcon icon={faMusic} />
            </Link>
          </li>

          <li>
            <Link to="/import" aria-label="Importer" title="Importer">
              <FontAwesomeIcon icon={faUpload} />
            </Link>
          </li>

          <li className="navbar-profile">
            <DropdownMenu
              items={[
                { label: 'Profil', onClick: () => navigate('/profile') },
                { label: 'Préférences', onClick: () => navigate('/preferences') },
                { label: 'Déconnexion', onClick: handleLogout },
              ]}
              trigger={
                <img
                  src={avatarSrc}
                  alt="User Profile"
                  className="navbar-profile-image"
                />
              }
            />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
