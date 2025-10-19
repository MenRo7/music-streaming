import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import DropdownMenu from './DropdownMenu';

export type SortOption = 'title' | 'artist' | 'date_added';

interface SortButtonProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SortButton: React.FC<SortButtonProps> = ({ currentSort, onSortChange }) => {
  const { t } = useTranslation();

  const sortOptions = [
    { label: t('sort.byTitle'), value: 'title' as SortOption },
    { label: t('sort.byArtist'), value: 'artist' as SortOption },
    { label: t('sort.byDateAdded'), value: 'date_added' as SortOption },
  ];

  const items = sortOptions.map((option) => ({
    label: option.label + (currentSort === option.value ? ' ✓' : ''),
    onClick: () => onSortChange(option.value),
  }));

  return (
    <DropdownMenu
      items={items}
      trigger={
        <button className="sort-button">
          <FontAwesomeIcon icon={faSort} className="control-icon" />
        </button>
      }
    />
  );
};

export default SortButton;
