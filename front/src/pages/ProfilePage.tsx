import React, { useState, useEffect } from "react";

import { fetchUser } from "../apis/UserService";

import EditProfileModal from "../components/EditProfileModal";
import DropdownMenu from "../components/DropdownMenu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

import "../styles/ProfilePage.css";

const ProfilePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const getUser = async () => {
    try {
      const response = await fetchUser();
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

  const openProfileModal = () => {
    setIsModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsModalOpen(false);
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  return (
    <div className="profile-content">
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
          <DropdownMenu
            trigger={
              <FontAwesomeIcon
                icon={faEllipsisH}
                className="profile-menu-icon"
              />
            }
            items={[
              {
                label: "Modifier le profil",
                onClick: openProfileModal,
              },
            ]}
          />
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
                <img src={artist.image} alt={artist.name} />
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
                <img src={album.image} alt={album.title} />
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
                <img src={playlist?.image} alt={playlist?.title} />
                <p>{playlist?.title}</p>
              </div>
            ))}
          </div>
        </div>
        {isModalOpen && (
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={closeProfileModal}
            user={user}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
