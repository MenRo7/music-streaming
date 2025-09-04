import React, { useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRandom, faEllipsisH, faBars } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '../components/DropdownMenu';
import SongList, { UISong } from '../components/SongList';
import { usePlayer, Track } from '../apis/PlayerContext';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import '../styles/MediaPage.css';

interface MediaSong extends Track {
  dateAdded?: string;
  playlistIds?: number[];
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
}

const toNumberArray = (arr: any[]): number[] =>
  (Array.isArray(arr) ? arr : []).map(Number).filter(Number.isFinite);

const MediaPage: React.FC<MediaPageProps> = ({
  title, artist, image, songs, isPlaylist = false,
  collectionType, collectionId, onEdit, onDelete, renderModal, getActions,
}) => {
  const { setCollectionContext, toggleShuffle, playSong, addToQueue } = usePlayer();

  const pagePlaylistId = collectionType === 'playlist' ? Number(collectionId) : undefined;

  const tracks = useMemo<Track[]>(
    () => songs.map(s => ({
      id: Number(s.id),
      name: s.name,
      artist: s.artist,
      album: s.album,
      album_image: s.album_image,
      audio: s.audio,
      duration: s.duration,
      playlistIds: Array.from(new Set([
        ...(s.playlistIds ?? []),
        ...(pagePlaylistId ? [pagePlaylistId] : []),
      ])).map(Number).filter(Number.isFinite),
    })),
    [songs, pagePlaylistId]
  );

  const normalizedSongs: UISong[] = useMemo(
    () => songs.map(s => ({
      id: Number(s.id),
      name: s.name,
      artist: s.artist,
      album: s.album,
      album_image: s.album_image,
      audio: s.audio,
      dateAdded: s.dateAdded,
      duration: s.duration,
      playlistIds: toNumberArray(s.playlistIds ?? []),
    })),
    [songs]
  );

  useEffect(() => {
    if (collectionType && collectionId !== undefined && collectionId !== null) {
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
          getActions={(song) => {
            const baseline = Array.from(
              new Set([...(song.playlistIds ?? []), ...(pagePlaylistId ? [pagePlaylistId] : [])])
            ) as number[];

            const defaultActions = [
              {
                label: 'Ajouter à une playlist',
                onClick: () => {},
                withPlaylistMenu: true,
                songId: song.id,
                existingPlaylistIds: baseline,
                onToggle: async (playlistId: number, checked: boolean) => {
                  try {
                    if (checked) await addMusicToPlaylist(playlistId, song.id);
                    else await removeMusicFromPlaylist(playlistId, song.id);
                  } catch (e) {
                    console.error('Maj playlist échouée', e);
                  }
                },
              },
              { label: 'Ajouter à la file d’attente', onClick: () => addToQueue(song) },
            ];

            const extra = isPlaylist && getActions ? getActions(song as any) : [];
            return [...defaultActions, ...extra];
          }}
        />
      </div>
      {renderModal}
    </div>
  );
};

export default MediaPage;
