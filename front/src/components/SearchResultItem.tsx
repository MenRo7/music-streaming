import React, { ReactNode } from 'react';

import '../styles/SearchResultItem.css';

interface SearchResultItemProps {
  image: string | null;
  label: string;
  isRounded?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const DEFAULT_IMAGE = '/default-playlist-image.png';

const SearchResultItem: React.FC<SearchResultItemProps> = ({ image, label, isRounded, onClick, children }) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <li className="search-result-item">
      <button
        className="search-result-item-button"
        onClick={onClick}
        type="button"
      >
        {image ? (
          <img
            src={image}
            alt={label}
            className={`search-result-item-image ${isRounded ? 'rounded' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : isRounded ? (
          <div className={`search-result-item-image search-result-item-placeholder rounded`}>
            {getInitials(label)}
          </div>
        ) : (
          <img
            src={DEFAULT_IMAGE}
            alt={label}
            className="search-result-item-image"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="search-result-content">
          <span className="search-result-item-label">{label}</span>
          {children}
        </div>
      </button>
    </li>
  );
};

export default SearchResultItem;
