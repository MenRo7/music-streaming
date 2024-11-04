import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <h1>Streaming App</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/player">Player</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
