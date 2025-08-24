// src/components/SongList.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from './DropdownMenu';
import PlaylistCheckboxMenu from './PlaylistCheckboxMenu';
import { usePlayer } from '../apis/PlayerContext';

import '../styles/SongList.css';

interface Song {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string;
  audio: string;
  dateAdded?: string;
  duration?: string;
  playlistIds?: number[];
}

interface DropdownAction {
  label: string;
  onClick: () => void;
  withPlaylistMenu?: boolean;
  songId?: number;
  existingPlaylistIds?: number[];
  onToggle?: (playlistId: number, checked: boolean) => void;
}

interface SongListProps {
  songs: Song[];
  showAlbum?: boolean;
  showArtist?: boolean;
  showDateAdded?: boolean;
  showDuration?: boolean;
  getActions?: (song: Song) => DropdownAction[];
}

const SongList: React.FC<SongListProps> = ({
  songs,
  showAlbum = true,
  showArtist = true,
  showDateAdded = true,
  showDuration = false,
  getActions,
}) => {
  const { playSong, currentTrackId, isPlaying } = usePlayer();
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (openMenuFor === null) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpenMenuFor(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuFor(null);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuFor]);

  const handlePlaySong = (song: Song) => {
    if (song.audio) {
      playSong(song.audio, song.name, song.artist, song.album_image || '', song.id);
    }
  };

  return (
    <table className="song-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nom</th>
          {showAlbum && <th>Album</th>}
          {showArtist && <th>Artiste</th>}
          {showDateAdded && <th>Date d&apos;ajout</th>}
          {showDuration && <th>Durée</th>}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {songs.map((song, index) => {
          const actions = getActions ? getActions(song) : [];
          const playlistAction = actions.find((a) => a.withPlaylistMenu);

          const sharedDropdownItems = actions.map((action) => ({
            label: action.label,
            onClick: () => {
              if (action.withPlaylistMenu) {
                setOpenMenuFor((prev) => (prev === song.id ? null : song.id));
              } else {
                action.onClick();
              }
            },
          }));

          const isRowMenuOpen = openMenuFor === song.id;

          return (
            <tr
              key={song.id}
              className={`song-row ${isPlaying && currentTrackId === song.id ? 'playing' : ''}`}
            >
              <td className="track-number-cell" onClick={() => handlePlaySong(song)}>
                <span className="track-number">{index + 1}</span>
                <FontAwesomeIcon icon={faPlay} className="hover-play-icon" />
              </td>

              <td>{song.name}</td>
              {showAlbum && <td>{song.album}</td>}
              {showArtist && <td>{song.artist}</td>}
              {showDateAdded && <td>{song.dateAdded}</td>}
              {showDuration && <td>{song.duration || '—'}</td>}

              <td>
                <div
                  ref={isRowMenuOpen ? wrapperRef : null}
                  style={{ position: 'relative' }}
                >
                  <DropdownMenu
                    items={sharedDropdownItems}
                    trigger={<FontAwesomeIcon icon={faEllipsisV} className="action-icon" />}
                    menuClassName="song-dropdown-menu"
                  />

                  {playlistAction && isRowMenuOpen && (
                    <div style={{ position: 'absolute', top: 40, right: 180, zIndex: 1100 }}>
                      <PlaylistCheckboxMenu
                        songId={song.id}
                        existingPlaylistIds={playlistAction.existingPlaylistIds || []}
                        onToggle={playlistAction.onToggle || (() => {})}
                      />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SongList;
