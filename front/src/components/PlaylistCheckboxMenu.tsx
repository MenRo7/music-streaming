import React, { useEffect, useState } from 'react';
import { usePlaylists } from '../apis/PlaylistContext';

import '../styles/PlaylistCheckboxMenu.css';

interface PlaylistCheckboxMenuProps {
  songId: number;
  existingPlaylistIds: number[];
  onToggle: (playlistId: number, checked: boolean) => void;
}

const PlaylistCheckboxMenu: React.FC<PlaylistCheckboxMenuProps> = ({
  songId,
  existingPlaylistIds,
  onToggle,
}) => {
  const { playlists } = usePlaylists();
  const [selected, setSelected] = useState<number[]>(existingPlaylistIds);

  const handleChange = (playlistId: number) => {
    const isSelected = selected.includes(playlistId);
    const newSelection = isSelected
      ? selected.filter((id) => id !== playlistId)
      : [...selected, playlistId];

    setSelected(newSelection);
    onToggle(playlistId, !isSelected);
  };

  useEffect(() => {
    setSelected(existingPlaylistIds);
  }, [existingPlaylistIds]);

  return (
    <div className="playlist-checkbox-menu">
      {playlists.map((playlist) => (
        <label key={playlist.id} className="playlist-item">
          <input
            type="checkbox"
            checked={selected.includes(playlist.id)}
            onChange={() => handleChange(playlist.id)}
          />
          {playlist.title}
        </label>
      ))}
    </div>
  );
};

export default PlaylistCheckboxMenu;
