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

interface SearchResultsDropdownProps {
  users?: User[];
  playlists?: Playlist[];
  visible: boolean;
  onClose: () => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  users = [],
  playlists = [],
  visible,
  onClose
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

  if (!visible || (users.length === 0 && playlists.length === 0)) return null;

  return (
    <div className="search-results-dropdown" ref={dropdownRef}>
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
    </div>
  );
};

export default SearchResultsDropdown;
