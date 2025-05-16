import React, { useState, useEffect } from 'react';

import { search, SearchResults } from '../apis/GlobalSearchService';

import DropdownMenu from './DropdownMenu';
import SearchResultsDropdown from './SearchResultsDropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

import '../styles/GlobalSearchBar.css';

const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({});
  const [filters, setFilters] = useState({ user: false, playlist: false, music: false });
  const [showResults, setShowResults] = useState(false);

  const [usersPage, setUsersPage] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(1);
  const [musicsPage, setMusicsPage] = useState(1);

  const [loadingMore, setLoadingMore] = useState(false);
  const perPage = 10;

  useEffect(() => {
    if (!query.trim()) {
      setResults({});
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      const rawCategories = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key as 'user' | 'playlist' | 'music');

      const categoriesToSend: ('user' | 'playlist' | 'music')[] =
        rawCategories.length === 0
          ? ['user', 'playlist', 'music']
          : rawCategories;

      setLoadingMore(true);
      const newResults = await search(query, categoriesToSend, usersPage, playlistsPage, musicsPage, perPage);
      setLoadingMore(false);

      setResults((prev: any) => {
        const merged = { ...prev };

        if (newResults.users) {
          merged.users = {
            ...newResults.users,
            data: usersPage === 1
              ? newResults.users.data
              : [...(prev.users?.data || []), ...newResults.users.data]
          };
        }

        if (newResults.playlists) {
          merged.playlists = {
            ...newResults.playlists,
            data: playlistsPage === 1
              ? newResults.playlists.data
              : [...(prev.playlists?.data || []), ...newResults.playlists.data]
          };
        }

        if (newResults.musics) {
          merged.musics = musicsPage === 1
            ? newResults.musics
            : [...(prev.musics || []), ...newResults.musics];
        }

        return merged;
      });

      setShowResults(true);
    };

    fetchResults();
  }, [query, filters, usersPage, playlistsPage, musicsPage]);

  useEffect(() => {
    setUsersPage(1);
    setPlaylistsPage(1);
    setMusicsPage(1);
    setResults({});
  }, [query, filters]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottomReached = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottomReached && !loadingMore) {
      handleLoadMore();
    }
  };

  const handleLoadMore = () => {
    if (loadingMore) return;

    const anyFilter = filters.user || filters.playlist || filters.music;

    if (filters.user || !anyFilter) {
      setUsersPage(prev => prev + 1);
    }
    if (filters.playlist || !anyFilter) {
      setPlaylistsPage(prev => prev + 1);
    }
    if (filters.music || !anyFilter) {
      setMusicsPage(prev => prev + 1);
    }
  };

  return (
    <div className="global-search-container">
      <div className="global-search-wrapper">
        <div className="global-search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une chanson, un artiste..."
            className="global-search-input"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="global-search-icon"
            onClick={() => setQuery(query.trim())}
          />
          <DropdownMenu
            trigger={<FontAwesomeIcon icon={faFilter} className="global-search-filter-icon" />}
            menuClassName="search-filter-menu"
            items={[
              {
                label: `${filters.user ? '✅' : '☐'} Utilisateurs`,
                onClick: () => setFilters(prev => ({ ...prev, user: !prev.user })),
              },
              {
                label: `${filters.playlist ? '✅' : '☐'} Playlists`,
                onClick: () => setFilters(prev => ({ ...prev, playlist: !prev.playlist })),
              },
              {
                label: `${filters.music ? '✅' : '☐'} Titres`,
                onClick: () => setFilters(prev => ({ ...prev, music: !prev.music })),
              },
            ]}
          />
        </div>

        <div
          className="search-results-scroll-container"
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          onScroll={handleScroll}
        >
          <SearchResultsDropdown
            users={results?.users?.data}
            playlists={results?.playlists?.data}
            musics={results?.musics}
            visible={showResults}
            onClose={() => setShowResults(false)}
            onLoadMore={handleLoadMore}
            loadingMore={loadingMore}
          />
          {loadingMore && <div>Chargement...</div>}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchBar;
