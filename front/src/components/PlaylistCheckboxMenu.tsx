import React, { useMemo } from 'react';
import { usePlaylists } from '../contexts/PlaylistContext';
import '../styles/PlaylistCheckboxMenu.css';

interface PlaylistCheckboxMenuProps {
  songId?: number;
  existingPlaylistIds: Array<number | string>;
  onToggle: (playlistId: number, checked: boolean) => void;
}

const toNumberArray = (arr: Array<number | string>): number[] =>
  (Array.isArray(arr) ? arr : [])
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));

const PlaylistCheckboxMenu: React.FC<PlaylistCheckboxMenuProps> = ({
  songId,
  existingPlaylistIds,
  onToggle,
}) => {
  const { playlists } = usePlaylists();

  const selected = useMemo(() => toNumberArray(existingPlaylistIds), [existingPlaylistIds]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const handleChange = (pid: number | string) => {
    const n = Number(pid);
    const willCheck = !selectedSet.has(n);
    onToggle(n, willCheck);
  };

  return (
    <div className="playlist-checkbox-menu">
      {playlists.map((pl) => {
        const pid = Number(pl.id);
        return (
          <div key={pl.id} className="playlist-checkbox-item">
            <input
              id={`pl-${pl.id}`}
              type="checkbox"
              checked={selectedSet.has(pid)}
              onChange={() => handleChange(pid)}
            />
            <label htmlFor={`pl-${pl.id}`}>{pl.title}</label>
          </div>
        );
      })}
    </div>
  );
};

export default PlaylistCheckboxMenu;
