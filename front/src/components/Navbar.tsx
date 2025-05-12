import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from '../apis/AuthContext';
import { useUser } from '../apis/UserContext';

import DropdownMenu from './DropdownMenu';

import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <img src="/logo.png" alt="logo" className="navbar-logo" />
        <ul>
          <li>
            <Link to="/main">
              <FontAwesomeIcon icon={faHome} />
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
                  src={currentUser?.profile_image}
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
