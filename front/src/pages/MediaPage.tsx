import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRandom, faEllipsisH, faBars } from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from '../components/DropdownMenu';
import SongList from '../components/SongList';

import '../styles/MediaPage.css';

interface Song {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string;
  audio: string;
  dateAdded?: string;
  duration?: string;
}

interface MediaPageProps {
  title: string;
  artist?: string;
  image: string;
  songs: Song[];
  isPlaylist?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  renderModal?: React.ReactNode;
  getActions?: (song: Song) => { label: string; onClick: () => void }[]; // 👈 ajouter ceci
}

const MediaPage: React.FC<MediaPageProps> = ({
  title,
  artist,
  image,
  songs,
  isPlaylist = false,
  onEdit,
  onDelete,
  renderModal,
  getActions, // 👈 ici aussi
}) => {
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
          <FontAwesomeIcon icon={faPlay} className="control-icon" />
          <FontAwesomeIcon icon={faRandom} className="control-icon" />
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
          songs={songs}
          showAlbum={true}
          showArtist={true}
          showDateAdded={true}
          showDuration={false}
          getActions={isPlaylist ? getActions : undefined} // 👈 passe les actions seulement si c’est une playlist
        />
      </div>

      {renderModal}
    </div>
  );
};

export default MediaPage;
