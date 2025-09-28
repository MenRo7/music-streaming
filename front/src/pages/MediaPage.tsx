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

interface MediaPageProps {
  title: string;
  artist?: string;
  image: string;
  songs: MediaSong[];
  isPlaylist?: boolean;
  collectionType?: 'playlist' | 'album';
  collectionId?: number | string;
  onEdit?: () => void;
  onDelete?: () => void;
  renderModal?: React.ReactNode;
  getActions?: (song: MediaSong) => { label: string; onClick: () => void }[];
  isLiked?: boolean;
  onToggleLike?: () => void;
  onAlbumClick?: (song: UISong) => void;
  onArtistClick?: (song: UISong) => void;
}

const toNumberArray = (arr: any[]): number[] =>
  (Array.isArray(arr) ? arr : []).map(Number).filter(Number.isFinite);

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
}) => {
  const { setCollectionContext, toggleShuffle, playSong } = usePlayer();

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
        playlistIds: toNumberArray(s.playlistIds ?? []),
      })),
    [songs]
  );

  const normalizedSongs: UISong[] = useMemo(
    () =>
      songs.map((s) =>
        ({
          id: Number(s.id),
          name: s.name,
          artist: s.artist,
          album: s.album,
          album_image: s.album_image,
          audio: s.audio,
          dateAdded: s.dateAdded,
          duration: s.duration,
          playlistIds: toNumberArray(s.playlistIds ?? []),
          ...(s as any).album_id != null ? { album_id: (s as any).album_id } : {},
          ...(s as any).artist_user_id != null ? { artist_user_id: (s as any).artist_user_id } : {},
        } as any)
      ),
    [songs]
  );

  useEffect(() => {
    if (collectionType && collectionId != null) {
      setCollectionContext({ type: collectionType, id: Number(collectionId) }, tracks);
    }
  }, [collectionType, collectionId, tracks, setCollectionContext]);

  const onPlayAll = () => {
    const first = normalizedSongs[0];
    if (first) playSong(first.audio, first.name, first.artist, first.album_image || '', first.id);
  };

  const onShuffleAll = () => {
    toggleShuffle();
    onPlayAll();
  };

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
              title={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            />
          )}

          {(onEdit || onDelete) && (
            <DropdownMenu
              items={[
                ...(onEdit ? [{ label: 'Modifier', onClick: onEdit }] : []),
                ...(onDelete ? [{ label: 'Supprimer', onClick: onDelete }] : []),
              ]}
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
          getActions={getActions as any}
          onAlbumClick={onAlbumClick}
          onArtistClick={onArtistClick}
        />
      </div>
      {renderModal}
    </div>
  );
};

export default MediaPage;
