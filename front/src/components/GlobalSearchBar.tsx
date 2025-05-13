import React, { useState, useEffect } from 'react';

import { search } from '../apis/GlobalSearchService';

import DropdownMenu from './DropdownMenu';
import SearchResultsDropdown from './SearchResultsDropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

import '../styles/GlobalSearchBar.css';

const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [filters, setFilters] = useState({ user: false, playlist: false });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) return;

      let category: 'user' | 'playlist' | 'all' = 'all';
      if (!filters.user && !filters.playlist) category = 'all';
      else if (filters.user && filters.playlist) category = 'all';
      else if (filters.user) category = 'user';
      else if (filters.playlist) category = 'playlist';

      try {
        const data = await search(query, category);
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Erreur lors de la recherche :', error);
      }
    };

    handleSearch();
  }, [query, filters]);

  const handleToggleFilter = (type: 'user' | 'playlist') => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setQuery(query.trim());
    }
  };

  return (
    <div className="global-search-container">
      <div className="global-search-wrapper">
        <div className="global-search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
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
                onClick: () => handleToggleFilter('user'),
              },
              {
                label: `${filters.playlist ? '✅' : '☐'} Playlists`,
                onClick: () => handleToggleFilter('playlist'),
              },
            ]}
          />
        </div>

        <SearchResultsDropdown
          users={results?.users?.data}
          playlists={results?.playlists?.data}
          visible={showResults}
          onClose={() => setShowResults(false)}
        />
      </div>
    </div>
  );
};

export default GlobalSearchBar;
