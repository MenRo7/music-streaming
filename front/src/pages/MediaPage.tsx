import React, { useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faRandom,
  faEllipsisH,
  faBars,
  faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import DropdownMenu from '../components/DropdownMenu';
import SongList, { UISong } from '../components/SongList';
import { usePlayer, Track } from '../apis/PlayerContext';
import '../styles/MediaPage.css';

interface MediaSong extends Track {
  dateAdded?: string;
  playlistIds?: number[];
  album_id?: number;
  artist_user_id?: number;
}

type MenuItem = {
  label: string;
  onClick: () => void;
  submenuContent?: React.ReactNode;
};

interface MediaPageProps {
  title: string;
  artist?: string;
  image: string;
  songs: MediaSong[];
  isPlaylist?: boolean;
  collectionType?: 'playlist' | 'album' | 'favorites';
  collectionId?: number | string;
  onEdit?: () => void;
  onDelete?: () => void;
  renderModal?: React.ReactNode;
  getActions?: (song: MediaSong) => { label: string; onClick: () => void }[];
  isLiked?: boolean;
  onToggleLike?: () => void;
  onAlbumClick?: (song: UISong) => void;
  onArtistClick?: (song: UISong) => void;
  headerMenuItems?: MenuItem[];
}

// ✅ Utilitaire commun: supporte un tableau d'ids ou d'objets { id }
const extractPlaylistIds = (val: any): number[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => (x && typeof x === 'object' ? x.id : x))
    .map(Number)
    .filter(Number.isFinite);
};

const MediaPage: React.FC<MediaPageProps> = ({
  title,
  artist,
  image,
  songs,
  collectionType,
  collectionId,
  onEdit,
  onDelete,
  renderModal,
  getActions,
  isLiked = false,
  onToggleLike,
  onAlbumClick,
  onArtistClick,
  headerMenuItems = [],
}) => {
  const { t } = useTranslation();
  const { setCollectionContext, toggleShuffle, playSong, playFromList } = usePlayer();
  const location = useLocation();
  const isAlbumPage = location.pathname.startsWith('/album');
  const isProfilePage = location.pathname.startsWith('/profile');

  const tracks = useMemo<Track[]>(
    () =>
      songs.map((s) => ({
        id: Number(s.id),
        name: s.name,
        artist: s.artist,
        album: s.album,
        album_image: s.album_image,
        audio: s.audio,
        duration: s.duration,
        playlistIds: extractPlaylistIds(s.playlistIds ?? []),
        album_id: s.album_id,
        artist_user_id: s.artist_user_id,
      })),
    [songs]
  );

  const normalizedSongs: UISong[] = useMemo(
    () =>
      songs.map(
        (s) =>
          ({
            id: Number(s.id),
            name: s.name,
            artist: s.artist,
            album: s.album,
            album_image: s.album_image,
            audio: s.audio,
            dateAdded: s.dateAdded,
            duration: s.duration,
            playlistIds: extractPlaylistIds(s.playlistIds ?? []),
            ...(s as any).album_id != null ? { album_id: (s as any).album_id } : {},
            ...(s as any).artist_user_id != null ? { artist_user_id: (s as any).artist_user_id } : {},
          } as any)
      ),
    [songs]
  );

  useEffect(() => {
    if (collectionType === 'favorites') {
      setCollectionContext({ type: 'playlist', id: 0 }, tracks);
      return;
    }
    if ((collectionType === 'playlist' || collectionType === 'album') && collectionId != null) {
      setCollectionContext({ type: collectionType, id: Number(collectionId) }, tracks);
    }
  }, [collectionType, collectionId, tracks, setCollectionContext]);

  const onPlayAll = () => {
    const first = normalizedSongs[0];
    if (!first) return;

    if (collectionType === 'favorites') {
      playFromList(tracks, first.id);
    } else {
      playSong(
        first.audio,
        first.name,
        first.artist,
        first.album_image || '',
        first.id,
        {
          playlistIds: first.playlistIds,
          album_id: first.album_id,
          artist_user_id: first.artist_user_id,
        }
      );
    }
  };

  const onShuffleAll = () => {
    toggleShuffle();
    onPlayAll();
  };

  const composedGetActions = (song: UISong) => {
    const base = (getActions ? getActions(song as any) : []) ?? [];
    const s: any = song;
    const extras: { label: string; onClick: () => void }[] = [];

    if (!isAlbumPage && onAlbumClick && s?.album_id) {
      extras.push({ label: t('mediaPage.viewAlbum'), onClick: () => onAlbumClick(song) });
    }
    if (!isProfilePage && onArtistClick && s?.artist_user_id) {
      extras.push({ label: t('mediaPage.viewArtist'), onClick: () => onArtistClick(song) });
    }

    return [...extras, ...base];
  };

  const hasHeaderMenu = headerMenuItems.length > 0 || Boolean(onEdit) || Boolean(onDelete);

  const combinedHeaderMenu: MenuItem[] = [
    ...headerMenuItems,
    ...(onEdit ? [{ label: t('common.edit'), onClick: onEdit }] : []),
    ...(onDelete ? [{ label: t('common.delete'), onClick: onDelete }] : []),
  ];

  return (
    <div className="media-content">
      <div className="media-page">
        <div className="media-header">
          <img className="media-page-image" src={image} alt={title} />
          <div className="media-texts">
            <h1>{title}</h1>
            {artist && <p className="media-artist">{artist}</p>}
          </div>
        </div>

        <div className="media-controls">
          <FontAwesomeIcon icon={faPlay} className="control-icon" onClick={onPlayAll} />
          <FontAwesomeIcon icon={faRandom} className="control-icon" onClick={onShuffleAll} />

          {onToggleLike && (
            <FontAwesomeIcon
              icon={isLiked ? faHeartSolid : faHeartRegular}
              className={`control-icon heart-icon ${isLiked ? 'liked' : ''}`}
              onClick={onToggleLike}
              title={isLiked ? t('mediaPage.removeFromFavorites') : t('mediaPage.addToFavorites')}
            />
          )}

          {hasHeaderMenu && (
            <DropdownMenu
              items={combinedHeaderMenu}
              trigger={<FontAwesomeIcon icon={faEllipsisH} className="control-icon" />}
            />
          )}

          <FontAwesomeIcon icon={faBars} className="control-icon burger-menu" />
        </div>

        <SongList
          songs={normalizedSongs}
          showAlbum
          showArtist
          showDateAdded
          showDuration={false}
          getActions={composedGetActions as any}
          onAlbumClick={onAlbumClick}
          onArtistClick={onArtistClick}
        />
      </div>
      {renderModal}
    </div>
  );
};

export default MediaPage;
