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
    <div className="song-table-wrapper">
      <table className="song-table">
        <colgroup>
          <col style={{ width: 56 }} /> {/* # */}
          <col />                       {/* Nom */}
          {showAlbum && <col />}        {/* Album */}
          {showArtist && <col />}       {/* Artiste */}
          {showDateAdded && <col style={{ width: 130 }} />} {/* Date */}
          {showDuration && <col style={{ width: 90 }} />}   {/* Durée */}
          <col style={{ width: 64 }} /> {/* Action */}
        </colgroup>

        <thead>
          <tr>
            <th className="col-index">#</th>
            <th className="col-name">Nom</th>
            {showAlbum && <th className="col-album">Album</th>}
            {showArtist && <th className="col-artist">Artiste</th>}
            {showDateAdded && <th className="col-date">Date d&apos;ajout</th>}
            {showDuration && <th className="col-duration">Durée</th>}
            <th className="col-actions">Action</th>
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

            const isCurrent = isPlaying && Number(currentTrackId) === Number(song.id);

            return (
              <tr key={song.id} className={`song-row ${isCurrent ? 'playing' : ''}`}>
                <td className="track-number-cell col-index" onClick={() => handlePlaySong(song)}>
                  <span className="track-number">{index + 1}</span>
                  <FontAwesomeIcon icon={faPlay} className="hover-play-icon" />
                </td>

                <td className="cell--truncate col-name" title={song.name}>{song.name}</td>
                {showAlbum && (
                  <td className="cell--truncate col-album" title={song.album || ''}>
                    {song.album}
                  </td>
                )}
                {showArtist && (
                  <td className="cell--truncate col-artist" title={song.artist}>
                    {song.artist}
                  </td>
                )}
                {showDateAdded && (
                  <td className="col-date">{song.dateAdded}</td>
                )}
                {showDuration && (
                  <td className="col-duration">{song.duration || '—'}</td>
                )}

                <td className="col-actions">
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
    </div>
  );
};

export default SongList;
