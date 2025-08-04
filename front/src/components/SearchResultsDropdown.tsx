import React, { useEffect, useRef } from 'react';

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

interface Track {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string | null;
}

interface SearchResultsDropdownProps {
  users?: User[];
  playlists?: Playlist[];
  musics?: Track[];
  visible: boolean;
  onClose: () => void;
  onLoadMore: () => void;
  loadingMore: boolean;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  users = [],
  playlists = [],
  musics = [],
  visible,
  onClose,
  onLoadMore,
  loadingMore
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const bottomReached = scrollHeight - scrollTop <= clientHeight + 10;

    if (bottomReached && !loadingMore) {
      onLoadMore();
    }
  };

  if (!visible || (users.length === 0 && playlists.length === 0 && musics.length === 0)) return null;

  return (
    <div
      className="search-results-dropdown"
      ref={dropdownRef}
      style={{ maxHeight: '400px', overflowY: 'auto' }}
      onScroll={handleScroll}
    >
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
              />
            ))}
          </ul>
        </div>
      )}
      {playlists.length > 0 && (
        <div className="search-section">
          <h4>Playlists</h4>
          <ul className="search-result-list">
            {playlists.map(playlist => (
              <SearchResultItem
                key={playlist.id}
                image={playlist.image}
                label={playlist.title}
              />
            ))}
          </ul>
        </div>
      )}
      {musics.length > 0 && (
        <div className="search-section">
          <h4>Musiques libres</h4>
          <ul className="search-result-list">
            {musics.map(track => (
              <SearchResultItem
                key={track.id}
                image={track.image}
                label={`${track.name} - ${track.artist_name}`}
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
