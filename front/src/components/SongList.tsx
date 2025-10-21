import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from './DropdownMenu';
import PlaylistCheckboxMenu from './PlaylistCheckboxMenu';
import { usePlayer } from '../apis/PlayerContext';

import '../styles/SongList.css';

// Fonction utilitaire pour formater la durée en secondes vers mm:ss
const formatDuration = (seconds: number | string | null | undefined): string => {
  if (seconds == null) return '—';
  const numSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  if (!Number.isFinite(numSeconds) || numSeconds < 0) return '—';

  const mins = Math.floor(numSeconds / 60);
  const secs = Math.floor(numSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export interface UISong {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string;
  audio: string;
  dateAdded?: string;
  duration?: number | string;  // Durée en secondes (number) ou formatée (string)
  playlistIds?: number[];
  album_id?: number;
  artist_user_id?: number;
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
  onAlbumClick?: (song: T) => void;
  onArtistClick?: (song: T) => void;
}

const SongList = <T extends UISong>({
  songs,
  showAlbum = true,
  showArtist = true,
  showDateAdded = true,
  showDuration = false,
  getActions,
  onAlbumClick,
  onArtistClick,
}: SongListProps<T>) => {
  const { t } = useTranslation();
  const { playSong, currentTrackId, isPlaying } = usePlayer();
  const [overridePlaylists, setOverridePlaylists] = useState<Record<number, number[]>>({});

  useEffect(() => {
    const onExternalUpdate = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const { trackId, playlistIds } = ce.detail || {};
      if (!Number.isFinite(trackId)) return;
      setOverridePlaylists((prev) => ({ ...prev, [Number(trackId)]: (playlistIds || []).map(Number) }));
    };
    window.addEventListener('track:playlist-updated', onExternalUpdate as EventListener);
    return () => window.removeEventListener('track:playlist-updated', onExternalUpdate as EventListener);
  }, []);

  const handlePlaySong = (song: T) => {
    if (!song.audio) return;
    const s: any = song;
    playSong(
      song.audio,
      song.name,
      song.artist,
      song.album_image || '',
      song.id,
      {
        playlistIds: song.playlistIds,
        album_id: s.album_id,
        artist_user_id: s.artist_user_id,
      }
    );
  };

  const toggleLocal = (song: T, playlistId: number, checked: boolean) => {
    setOverridePlaylists(prev => {
      const base = prev[song.id] ?? song.playlistIds ?? [];
      const next = checked
        ? (base.includes(playlistId) ? base : [...base, playlistId])
        : base.filter(id => id !== playlistId);

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('track:playlist-updated', {
            detail: { trackId: Number(song.id), playlistIds: next.map(Number) },
          })
        );
      }, 0);

      return { ...prev, [song.id]: next.map(Number) };
    });
  };

  const LinkCell: React.FC<{
    text?: string;
    title?: string;
    onClick?: () => void;
    className?: string;
  }> = ({ text, title, onClick, className }) => {
    if (!text) return <td className={className} />;
    const isLink = Boolean(onClick);
    return (
      <td
        className={`${className || ''} ${isLink ? 'cell-link' : ''}`}
        title={title || text}
        role={isLink ? ('button' as any) : undefined}
        tabIndex={isLink ? 0 : -1}
        onClick={isLink ? onClick : undefined}
        onKeyDown={(e) => {
          if (isLink && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick?.();
          }
        }}
        style={isLink ? { cursor: 'pointer', textDecoration: 'underline' } : undefined}
      >
        {text}
      </td>
    );
  };

  return (
    <div className="song-table-wrapper">
      <table className="song-table">
        <colgroup>
          <col style={{ width: 56 }} />
          <col />
          {showAlbum && <col />}
          {showArtist && <col />}
          {showDateAdded && <col style={{ width: 130 }} />}
          {showDuration && <col style={{ width: 90 }} />}
          <col style={{ width: 64 }} />
        </colgroup>

        <thead>
          <tr>
            <th className="col-index">{t('songList.index')}</th>
            <th className="col-name">{t('songList.name')}</th>
            {showAlbum && <th className="col-album">{t('songList.album')}</th>}
            {showArtist && <th className="col-artist">{t('songList.artist')}</th>}
            {showDateAdded && <th className="col-date">{t('songList.dateAdded')}</th>}
            {showDuration && <th className="col-duration">{t('songList.duration')}</th>}
            <th className="col-actions">{t('songList.actions')}</th>
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
                label: action.label || t('songList.addToPlaylist'),
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
                  <LinkCell
                    className="cell--truncate col-album"
                    text={song.album || ''}
                    title={song.album || ''}
                    onClick={onAlbumClick ? () => onAlbumClick(song) : undefined}
                  />
                )}

                {showArtist && (
                  <LinkCell
                    className="cell--truncate col-artist"
                    text={song.artist}
                    title={song.artist}
                    onClick={onArtistClick ? () => onArtistClick(song) : undefined}
                  />
                )}

                {showDateAdded && (
                  <td className="col-date">{song.dateAdded}</td>
                )}
                {showDuration && (
                  <td className="col-duration">{formatDuration(song.duration)}</td>
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
