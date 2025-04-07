import React, { useState, useEffect } from "react";

import axios from "axios";
import { API_URL } from "../apis/api";

import EditProfileModal from "../components/EditProfileModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

import "../styles/ProfilePage.css";

const ProfilePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const getUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      setUser(response.data);
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".menu-container")) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  return (
    <div className="main-content">
      <div className="profile-page">
        <div className="profile-header">
        <img
          className="profile-image"
          src={user?.profile_image}
          alt="User Profile"
        />
          <div className="profile-info">
            <h1>{user?.name}</h1>
          </div>
          <div className="menu-container">
            <FontAwesomeIcon
              icon={faEllipsisH}
              className="profile-menu-icon"
              onClick={toggleMenu}
            />
            {menuOpen && (
              <div className="dropdown-menu-profile">
                <button onClick={handleEditProfile}>Modifier le profil</button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h2>Heures d'écoute</h2>
            <p>{user?.totalListeningHours} heures</p>
          </div>
          <div className="stat-card">
            <h2>Chanson préférée</h2>
            <p>{user?.favoriteSong}</p>
          </div>
        </div>

        <div className="top-section">
          <h2>Top Artistes du Mois</h2>
          <div className="top-artists">
            {user?.topArtists?.map((artist: any, index: number) => (
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
            {user?.topAlbums?.map((album: any, index: number) => (
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
            {user?.publicPlaylists?.map((playlist: any, index: number) => (
              <div key={index} className="playlists-card">
                <img src={playlist.imageUrl} alt={playlist.title} />
                <p>{playlist.title}</p>
              </div>
            ))}
          </div>
        </div>
        {isModalOpen && (
          <EditProfileModal
            isOpen={isModalOpen}
            closeModal={closeModal}
            user={user}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
