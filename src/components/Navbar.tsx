import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import '../styles/Navbar.css';

const userProfileImageUrl = '/joker.png';

const Navbar: React.FC = () => (
  <div className="navbar-container">
    <nav className="navbar">
      <img src="/logo.png" alt="logo" className="navbar-logo" />
      <ul>
        <li>
          <Link to="/">
            <FontAwesomeIcon icon={faHome} />
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <img
              src={userProfileImageUrl}
              alt="User Profile"
              className="navbar-profile-image"
            />
          </Link>
        </li>
      </ul>
    </nav>
  </div>
);

export default Navbar;
