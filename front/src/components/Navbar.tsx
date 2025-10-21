import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

import DropdownMenu from './DropdownMenu';
import GlobalSearchBar from './GlobalSearchBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUpload, faMusic } from '@fortawesome/free-solid-svg-icons'; // ⬅️ + faMusic

import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
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
      console.error(t('errors.logout'), error);
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
            <Link to="/main" aria-label={t('nav.home')} title={t('nav.home')}>
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>

          <li>
            <Link to="/my-music" aria-label={t('nav.myMusic')} title={t('nav.myMusic')}>
              <FontAwesomeIcon icon={faMusic} />
            </Link>
          </li>

          <li>
            <Link to="/import" aria-label={t('nav.import')} title={t('nav.import')}>
              <FontAwesomeIcon icon={faUpload} />
            </Link>
          </li>

          <li className="navbar-profile">
            <DropdownMenu
              items={[
                { label: t('nav.profile'), onClick: () => navigate('/profile') },
                { label: t('nav.preferences'), onClick: () => navigate('/preferences') },
                { label: t('nav.logout'), onClick: handleLogout },
              ]}
              trigger={
                <img
                  src={avatarSrc}
                  alt={t('nav.userProfile')}
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
