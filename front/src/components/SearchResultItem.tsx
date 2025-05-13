import React from 'react';

import '../styles/SearchResultItem.css';

interface SearchResultItemProps {
  image: string | null;
  label: string;
  isRounded?: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ image, label, isRounded }) => {
  return (
    <li className="search-result-item">
      {image && (
        <img
          src={image}
          alt={label}
          className={`search-result-item-image ${isRounded ? 'rounded' : ''}`}
        />
      )}
      <span className="search-result-item-label">{label}</span>
    </li>
  );
};

export default SearchResultItem;
