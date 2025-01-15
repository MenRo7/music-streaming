import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import '../styles/ProfilePage.css';
import { userStats, playlists } from '../utils/constants';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      <div className="profile-header">
        <img className="profile-image" src="/joker.png" alt="User Profile" />
        <div className="profile-info">
          <h1>Mon Profil</h1>
          <p>Nom d'utilisateur</p>
        </div>
        <FontAwesomeIcon
          icon={faEllipsisH}
          className="profile-menu-icon"
        />
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h2>Heures d'écoute</h2>
          <p>{userStats.totalListeningHours} heures</p>
        </div>
        <div className="stat-card">
          <h2>Chanson préférée</h2>
          <p>{userStats.favoriteSong}</p>
        </div>
      </div>

      <div className="top-section">
        <h2>Top Artistes du Mois</h2>
        <div className="top-artists">
          {userStats.topArtists.map((artist, index) => (
            <div key={index} className="artist-card">
              <img src={artist.imageUrl} alt={artist.name} />
              <p>{artist.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="top-section">
        <h2>Top Albums du Mois</h2>
        <div className="top-albums">
          {userStats.topAlbums.map((album, index) => (
            <div key={index} className="album-card">
              <img src={album.imageUrl} alt={album.title} />
              <div>
                <p>{album.title}</p>
                <p>{album.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="top-section">
        <h2>Playlists Publiques</h2>
        <div className="public-playlists">
          {playlists.map((playlist, index) => (
            <div key={index} className="playlists-card">
              <img src={playlist.imageUrl} alt={playlist.title} />
              <p>{playlist.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
