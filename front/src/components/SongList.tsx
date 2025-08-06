import React, { useState } from 'react';
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
          {showDateAdded && <th>Date d'ajout</th>}
          {showDuration && <th>Durée</th>}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {songs.map((song, index) => {
          const actions = getActions ? getActions(song) : [];
          const playlistAction = actions.find(a => a.withPlaylistMenu);
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
                <div style={{ position: 'relative' }}>
                  <DropdownMenu
                    items={actions.map((action) => ({
                      label: action.label,
                      onClick: () => {
                        if (action.withPlaylistMenu) {
                          setOpenMenuFor(openMenuFor === song.id ? null : song.id);
                        } else {
                          action.onClick();
                        }
                      },
                    }))}
                    trigger={<FontAwesomeIcon icon={faEllipsisV} className="action-icon" />}
                    menuClassName="song-dropdown-menu"
                  />
                  {playlistAction && openMenuFor === song.id && (
                    <div style={{ position: 'absolute', top: 40, right: 180 }}>
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
