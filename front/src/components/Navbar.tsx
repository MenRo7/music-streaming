import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../apis/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import '../styles/Navbar.css';

const userProfileImageUrl = '/joker.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileImageRef = useRef<HTMLImageElement>(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenuOnClickOutside = (e: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target as Node) &&
      !profileImageRef.current?.contains(e.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeMenuOnClickOutside);
    return () => {
      document.removeEventListener('click', closeMenuOnClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
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
            <img
              src={userProfileImageUrl}
              alt="User Profile"
              className="navbar-profile-image"
              ref={profileImageRef}
              onClick={toggleMenu}
            />
            {isMenuOpen && (
              <div className="dropdown-menu" ref={menuRef}>
                <ul>
                  <li>
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      Profil
                    </Link>
                  </li>
                  <li>
                    <Link to="/preferences" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      Préférences
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
