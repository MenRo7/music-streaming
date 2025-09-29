import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { usePlaylists } from '../apis/PlaylistContext';
import { getLikesSummary } from '../apis/UserService';

import PlaylistCard from './PlaylistCard';
import ProfileCircleCard from './ProfileCircleCard';

import CreateEditPlaylistModal from './CreateEditPlaylistModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

import '../styles/Sidebar.css';

type LikedAlbum = { id: number; title: string; image: string | null };
type LikedPlaylist = { id: number; title: string; image: string | null };
type SubscribedProfile = { id: number; name: string; image: string | null };

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { playlists, fetchPlaylists } = usePlaylists();

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);

  const [likedAlbums, setLikedAlbums] = useState<LikedAlbum[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<LikedPlaylist[]>([]);
  const [subs, setSubs] = useState<SubscribedProfile[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  const handleFilterClick = (filter: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const resetFilters = () => setActiveFilters(new Set());

  const openPlaylistModal = () => {
    setEditingPlaylist(null);
    setShowModal(true);
  };

  const closePlaylistModal = () => {
    setShowModal(false);
    fetchPlaylists();
  };

  const loadLikes = useCallback(async () => {
    try {
      setLoadingLikes(true);
      const res = await getLikesSummary();
      setLikedAlbums(res.albums ?? []);
      setLikedPlaylists(res.playlists ?? []);
      setSubs(res.profiles ?? []); // profils suivis
    } catch (e) {
      console.error('Erreur chargement likes:', e);
    } finally {
      setLoadingLikes(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
    loadLikes();
  }, [fetchPlaylists, loadLikes]);

  useEffect(() => {
    const reload = () => loadLikes();
    window.addEventListener('likes:changed', reload);
    return () => window.removeEventListener('likes:changed', reload);
  }, [loadLikes]);

  return (
    <div className="sidebar">
      <nav className="nav">
        <ul className="pill-container">
          <li>
            {activeFilters.size > 0 && (
              <div className="reset-filters" onClick={resetFilters}>
                <FontAwesomeIcon icon={faTimes} className="filter-clear-icon" />
              </div>
            )}
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('playlists') ? 'active' : ''}`}
              onClick={() => handleFilterClick('playlists')}
            >
              Playlists
            </button>
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('create') ? 'active' : ''}`}
              onClick={() => {
                handleFilterClick('create');
                openPlaylistModal();
              }}
              title="Créer une playlist"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </li>
        </ul>
      </nav>

      <div className="playlist-grid">
        <Link to="/favorites" key="favorites">
          <PlaylistCard title="Titres favoris" image="/favorites-cover.svg" />
        </Link>

        {playlists.map((playlist: any) => (
          <Link key={playlist.id} to={`/playlist/${playlist.id}`}>
            <PlaylistCard title={playlist.title} image={playlist.image} />
          </Link>
        ))}
      </div>

      <div className="liked-section">
        {loadingLikes && <div className="liked-loading">Chargement…</div>}

        {subs.length > 0 && (
          <>
            <div className="subs-grid">
              {subs.map((u) => (
                <ProfileCircleCard
                  key={`sub-${u.id}`}
                  name={u.name}
                  image={u.image || undefined}
                  onClick={() => navigate(`/profile?user=${u.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {likedPlaylists.length > 0 && (
          <>
            <div className="playlist-grid">
              {likedPlaylists.map((pl) => (
                <div
                  key={`lp-${pl.id}`}
                  role="button"
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                >
                  <PlaylistCard title={pl.title} image={pl.image} />
                </div>
              ))}
            </div>
          </>
        )}

        {likedAlbums.length > 0 && (
          <>
            <div className="playlist-grid">
              {likedAlbums.map((al) => (
                <div
                  key={`la-${al.id}`}
                  role="button"
                  onClick={() => navigate(`/album/${al.id}`)}
                >
                  <PlaylistCard title={al.title} image={al.image} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CreateEditPlaylistModal
        isOpen={showModal}
        onClose={closePlaylistModal}
        initialData={editingPlaylist || { title: '', image: '' }}
        mode={editingPlaylist ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Sidebar;
