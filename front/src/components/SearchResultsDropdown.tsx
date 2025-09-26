import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../apis/PlayerContext';
import SearchResultItem from './SearchResultItem';
import '../styles/SearchResultsDropdown.css';

interface User {
  id: number;
  name: string;
  profile_image: string | null;
}

interface Playlist {
  id: number;
  title: string;
  image: string | null;
}

interface Music {
  id: number;
  title: string;
  artist_name?: string | null;
  image?: string | null;
  audio?: string | null;
}

interface Album {
  id: number;
  title: string;
  image: string | null;
  artist_name?: string | null;
}

interface SearchResultsDropdownProps {
  users: User[];
  playlists: Playlist[];
  musics: Music[];
  albums: Album[];
  visible: boolean;
  onClose: () => void;
  onLoadMore: () => void;
  loadingMore?: boolean;

  /** Navigation callbacks (optionnels) */
  onAlbumClick?: (id: number) => void;
  onPlaylistClick?: (id: number) => void;
  onUserClick?: (id: number) => void;

  /** Pour overrider la lecture d’un titre (optionnel) */
  onTrackClick?: (track: Music) => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  users,
  playlists,
  musics,
  albums,
  visible,
  onClose,
  onLoadMore,
  loadingMore,
  onAlbumClick,
  onPlaylistClick,
  onUserClick,
  onTrackClick,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) onClose();
    };
    if (visible) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [visible, onClose]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && !loadingMore) {
      onLoadMore();
    }
  };

  const handleMusicClick = (track: Music) => {
    if (onTrackClick) return onTrackClick(track);
    if (!track.audio) return;
    playSong(track.audio, track.title, track.artist_name || 'Inconnu', track.image || '', track.id);
  };

  const handleAlbumClick = (id: number) => {
    if (onAlbumClick) onAlbumClick(id);
  };

  const handlePlaylistClick = (id: number) => {
    if (onPlaylistClick) onPlaylistClick(id);
  };

  const handleUserClick = (id: number) => {
    if (onUserClick) onUserClick(id);
  };

  if (!visible) return null;

  return (
    <div className="search-results-dropdown" ref={dropdownRef} onScroll={handleScroll}>
      {users.length > 0 && (
        <div className="search-section">
          <h4>Utilisateurs</h4>
          <ul className="search-result-list">
            {users.map(user => (
              <SearchResultItem
                key={user.id}
                image={user.profile_image}
                label={user.name}
                isRounded
                onClick={() => handleUserClick(user.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="search-section">
          <h4>Playlists</h4>
          <ul className="search-result-list">
            {playlists.map(pl => (
              <SearchResultItem
                key={pl.id}
                image={pl.image}
                label={pl.title}
                onClick={() => handlePlaylistClick(pl.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {musics.length > 0 && (
        <div className="search-section">
          <h4>Titres</h4>
          <ul className="search-result-list">
            {musics.map(track => (
              <SearchResultItem
                key={track.id}
                image={track.image || null}
                label={`${track.title}${track.artist_name ? ` - ${track.artist_name}` : ''}`}
                onClick={() => handleMusicClick(track)}
              />
            ))}
          </ul>
        </div>
      )}

      {albums.length > 0 && (
        <div className="search-section">
          <h4>Albums</h4>
          <ul className="search-result-list">
            {albums.map(album => (
              <SearchResultItem
                key={album.id}
                image={album.image}
                label={album.title}
                onClick={() => handleAlbumClick(album.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          Chargement...
        </div>
      )}
    </div>
  );
};

export default SearchResultsDropdown;
