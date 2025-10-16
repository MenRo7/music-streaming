import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { search, SearchResults } from '../apis/GlobalSearchService';
import DropdownMenu from './DropdownMenu';
import SearchResultsDropdown from './SearchResultsDropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

import '../styles/GlobalSearchBar.css';

const emptyResults: SearchResults = {
  users: { data: [] },
  playlists: { data: [] },
  musics: { data: [] },
  albums: { data: [] },
};

const GlobalSearchBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [filters, setFilters] = useState({ user: false, playlist: false, music: false, album: false });
  const [showResults, setShowResults] = useState(false);

  const [usersPage, setUsersPage] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(1);
  const [musicsPage, setMusicsPage] = useState(1);
  const [albumsPage, setAlbumsPage] = useState(1);

  const [loadingMore, setLoadingMore] = useState(false);
  const perPage = 10;

  useEffect(() => {
    if (!query.trim()) {
      setResults(emptyResults);
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      const rawCategories = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key as 'user' | 'playlist' | 'music' | 'album');

      const categoriesToSend: ('user' | 'playlist' | 'music' | 'album')[] =
        rawCategories.length === 0 ? ['user', 'playlist', 'music', 'album'] : rawCategories;

      setLoadingMore(true);
      const newResults = await search(
        query,
        categoriesToSend,
        usersPage,
        playlistsPage,
        musicsPage,
        albumsPage,
        perPage
      );
      setLoadingMore(false);

      setResults((prev) => {
        const merged: SearchResults = {
          users: { data: usersPage === 1 ? (newResults.users?.data ?? []) : [...(prev.users?.data ?? []), ...(newResults.users?.data ?? [])] },
          playlists: { data: playlistsPage === 1 ? (newResults.playlists?.data ?? []) : [...(prev.playlists?.data ?? []), ...(newResults.playlists?.data ?? [])] },
          musics: { data: musicsPage === 1 ? (newResults.musics?.data ?? []) : [...(prev.musics?.data ?? []), ...(newResults.musics?.data ?? [])] },
          albums: { data: albumsPage === 1 ? (newResults.albums?.data ?? []) : [...(prev.albums?.data ?? []), ...(newResults.albums?.data ?? [])] },
        };
        return merged;
      });

      setShowResults(true);
    };

    fetchResults();
  }, [query, filters, usersPage, playlistsPage, musicsPage, albumsPage]);

  useEffect(() => {
    setUsersPage(1);
    setPlaylistsPage(1);
    setMusicsPage(1);
    setAlbumsPage(1);
    setResults(emptyResults);
  }, [query, filters]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottomReached = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottomReached && !loadingMore) handleLoadMore();
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    const anyFilter = filters.user || filters.playlist || filters.music || filters.album;

    if (filters.user || !anyFilter) setUsersPage((p) => p + 1);
    if (filters.playlist || !anyFilter) setPlaylistsPage((p) => p + 1);
    if (filters.music || !anyFilter) setMusicsPage((p) => p + 1);
    if (filters.album || !anyFilter) setAlbumsPage((p) => p + 1);
  };

  return (
    <div className="global-search-container">
      <div className="global-search-wrapper">
        <div className="global-search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="global-search-input"
            onFocus={() => setShowResults(!!query.trim())}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="global-search-icon"
            onClick={() => setShowResults(!!query.trim())}
          />
          <DropdownMenu
            trigger={<FontAwesomeIcon icon={faFilter} className="global-search-filter-icon" />}
            menuClassName="search-filter-menu"
            items={[
              { label: `${filters.user ? '✅' : '☐'} ${t('search.users')}`, onClick: () => setFilters(prev => ({ ...prev, user: !prev.user })) },
              { label: `${filters.playlist ? '✅' : '☐'} ${t('search.playlists')}`, onClick: () => setFilters(prev => ({ ...prev, playlist: !prev.playlist })) },
              { label: `${filters.music ? '✅' : '☐'} ${t('search.tracks')}`, onClick: () => setFilters(prev => ({ ...prev, music: !prev.music })) },
              { label: `${filters.album ? '✅' : '☐'} ${t('search.albums')}`, onClick: () => setFilters(prev => ({ ...prev, album: !prev.album })) },
            ]}
          />
        </div>

        <div
          className="search-results-scroll-container"
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          onScroll={handleScroll}
        >
          <SearchResultsDropdown
            users={results?.users?.data ?? []}
            playlists={results?.playlists?.data ?? []}
            musics={results?.musics?.data ?? []}
            albums={results?.albums?.data ?? []}
            visible={showResults}
            onClose={() => setShowResults(false)}
            onLoadMore={handleLoadMore}
            loadingMore={loadingMore}
            onAlbumClick={(id) => { setShowResults(false); navigate(`/album/${id}`); }}
            onPlaylistClick={(id) => { setShowResults(false); navigate(`/playlist/${id}`); }}
            onUserClick={(id) => { setShowResults(false); navigate(`/profile?user=${id}`); }}
          />
          {loadingMore && <div>{t('common.loading')}</div>}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchBar;
