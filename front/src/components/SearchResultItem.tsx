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
  return (
    <li className="search-result-item" onClick={onClick}>  {/* Ajout de onClick sur l'élément */}
      {image && (
        <img
          src={image || DEFAULT_IMAGE}
          alt={label}
          className={`search-result-item-image ${isRounded ? 'rounded' : ''}`}
        />
      )}
      <div className="search-result-content">
        <span className="search-result-item-label">{label}</span>
        {children}
      </div>
    </li>
  );
};

export default SearchResultItem;
