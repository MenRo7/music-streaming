import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from './DropdownMenu';
import PlaylistCheckboxMenu from './PlaylistCheckboxMenu';
import { usePlayer } from '../apis/PlayerContext';

import '../styles/SongList.css';

export interface UISong {
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
  existingPlaylistIds?: number[] | (number | string)[];
  onToggle?: (playlistId: number, checked: boolean) => void;
}

interface SongListProps<T extends UISong = UISong> {
  songs: T[];
  showAlbum?: boolean;
  showArtist?: boolean;
  showDateAdded?: boolean;
  showDuration?: boolean;
  getActions?: (song: T) => DropdownAction[];
}

const SongList = <T extends UISong>({
  songs,
  showAlbum = true,
  showArtist = true,
  showDateAdded = true,
  showDuration = false,
  getActions,
}: SongListProps<T>) => {
  const { playSong, currentTrackId, isPlaying } = usePlayer();
  const [overridePlaylists, setOverridePlaylists] = useState<Record<number, number[]>>({});

  const handlePlaySong = (song: T) => {
    if (!song.audio) return;
    // ⬇️ On passe la baseline de playlists au PlayerContext pour le SongPlayer
    playSong(
      song.audio,
      song.name,
      song.artist,
      song.album_image || '',
      song.id,
      { playlistIds: song.playlistIds }
    );
  };

  const toggleLocal = (song: T, playlistId: number, checked: boolean) => {
    setOverridePlaylists(prev => {
      const base = prev[song.id] ?? song.playlistIds ?? [];
      const next = checked
        ? (base.includes(playlistId) ? base : [...base, playlistId])
        : base.filter(id => id !== playlistId);
      return { ...prev, [song.id]: next };
    });
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

          const sharedDropdownItems = actions.flatMap((action) => {
            if (!action.withPlaylistMenu) {
              return [{ label: action.label, onClick: action.onClick }];
            }

            const raw =
              (overridePlaylists[song.id] ??
                action.existingPlaylistIds ??
                song.playlistIds ??
                []) as (number | string)[];

            const computedExisting = Array.from(new Set(raw.map(Number)))
              .filter((n) => Number.isFinite(n)) as number[];

            const idsKey = computedExisting.slice().sort((a, b) => a - b).join('_');

            return [{
              label: action.label || 'Ajouter à une playlist',
              onClick: () => {},
              submenuContent: (
                <PlaylistCheckboxMenu
                  key={`pcm-${song.id}-${idsKey}`}
                  songId={action.songId ?? song.id}
                  existingPlaylistIds={computedExisting}
                  onToggle={(playlistId, checked) => {
                    toggleLocal(song, playlistId, checked);
                    action.onToggle?.(playlistId, checked);
                  }}
                />
              ),
            }];
          });

          return (
            <tr
              key={song.id}
              className={`song-row ${isPlaying && Number(currentTrackId) === Number(song.id) ? 'playing' : ''}`}
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
                <DropdownMenu
                  items={sharedDropdownItems}
                  trigger={<FontAwesomeIcon icon={faEllipsisV} className="action-icon" />}
                  menuClassName="song-dropdown-menu"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SongList;
