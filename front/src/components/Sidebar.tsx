import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

type MainFilter = 'playlists' | 'albums' | 'artists';

const LABELS: Record<MainFilter, string> = {
  playlists: 'Playlists',
  albums: 'Albums',
  artists: 'Artistes',
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { playlists, fetchPlaylists } = usePlaylists();

  const [activeFilters, setActiveFilters] = useState<Set<MainFilter>>(new Set());
  const [mineOnly, setMineOnly] = useState<boolean>(false); // demi-pilule "par vous"

  const [showModal, setShowModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);

  const [likedAlbums, setLikedAlbums] = useState<LikedAlbum[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<LikedPlaylist[]>([]);
  const [subs, setSubs] = useState<SubscribedProfile[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  const toggleFilter = (f: MainFilter) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) {
        next.delete(f);
        if (f === 'playlists') {
          setMineOnly(false);
        }
      } else {
        next.add(f);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setActiveFilters(new Set());
    setMineOnly(false);
  };

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
      setSubs(res.profiles ?? []);
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

  const showAll = activeFilters.size === 0;

  const show = useMemo(() => {
    const has = (k: MainFilter) => activeFilters.has(k);
    return {
      playlists: showAll || has('playlists'),
      albums: showAll || has('albums'),
      artists: showAll || has('artists'),
    };
  }, [activeFilters, showAll]);

  const playlistsToShow = useMemo(() => {
    if (!show.playlists) return { fav: false, mine: [], liked: [] };

    if (mineOnly) {
      return { fav: false, mine: playlists, liked: [] };
    }
    return { fav: true, mine: playlists, liked: likedPlaylists };
  }, [show.playlists, mineOnly, playlists, likedPlaylists]);

  return (
    <div className="sidebar">
      <nav className="nav">
        <ul className="pill-container">
          <li className="pill-with-addon">
            <button
              className={`link-button ${activeFilters.has('playlists') ? 'active' : ''}`}
              onClick={() => toggleFilter('playlists')}
              aria-pressed={activeFilters.has('playlists')}
            >
              {LABELS.playlists}
            </button>

            {activeFilters.has('playlists') && (
              <button
                className={`link-button half-pill ${mineOnly ? 'active' : ''}`}
                onClick={() => setMineOnly(v => !v)}
                aria-pressed={mineOnly}
                title="Afficher uniquement vos playlists"
              >
                par vous
              </button>
            )}
          </li>

          <li>
            <button
              className={`link-button ${activeFilters.has('albums') ? 'active' : ''}`}
              onClick={() => toggleFilter('albums')}
              aria-pressed={activeFilters.has('albums')}
            >
              {LABELS.albums}
            </button>
          </li>
          <li>
            <button
              className={`link-button ${activeFilters.has('artists') ? 'active' : ''}`}
              onClick={() => toggleFilter('artists')}
              aria-pressed={activeFilters.has('artists')}
            >
              {LABELS.artists}
            </button>
          </li>

          <li>
            <button
              className="link-button create-button"
              onClick={openPlaylistModal}
              title="Créer une playlist"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </li>
            {activeFilters.size > 0 && (
              <li className="reset-filters" onClick={resetFilters}>
                <FontAwesomeIcon icon={faTimes} className="filter-clear-icon" />
              </li>
            )}
        </ul>
      </nav>

      {show.playlists && (
        <>
          <div className="sidebar-section-separator">Bibliothèque</div>
          <div className="playlist-grid">
            {playlistsToShow.fav && (
              <Link to="/favorites" key="favorites">
                <PlaylistCard title="Titres favoris" image="/favorites-cover.svg" />
              </Link>
            )}

            {playlistsToShow.mine.map((pl: any) => (
              <Link key={pl.id} to={`/playlist/${pl.id}`}>
                <PlaylistCard title={pl.title} image={pl.image} />
              </Link>
            ))}

            {!mineOnly &&
              playlistsToShow.liked.map((pl) => (
                <div key={`lp-${pl.id}`} role="button" onClick={() => navigate(`/playlist/${pl.id}`)}>
                  <PlaylistCard title={pl.title} image={pl.image} />
                </div>
              ))}
          </div>
        </>
      )}

      {show.artists && (
        <>
          <div className="sidebar-section-separator">Artistes suivis</div>
          <div className="liked-section">
            {loadingLikes && <div className="liked-loading">Chargement…</div>}
            {subs.length > 0 ? (
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
            ) : (
              !loadingLikes && <div className="empty-hint">Vous ne suivez encore aucun artiste.</div>
            )}
          </div>
        </>
      )}

      {show.albums && (
        <>
          <div className="sidebar-section-separator">Albums aimés</div>
          <div className="liked-section">
            {loadingLikes && <div className="liked-loading">Chargement…</div>}
            {likedAlbums.length > 0 ? (
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
            ) : (
              !loadingLikes && <div className="empty-hint">Pas encore d’albums likés.</div>
            )}
          </div>
        </>
      )}

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
