import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRandom, faEllipsisH, faBars } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '../components/DropdownMenu';

import '../styles/MediaPage.css';


interface MediaPageProps {
  title: string;
  artist?: string;
  image: string;
  songs: any[];
  isPlaylist?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  renderModal?: React.ReactNode;
}

const MediaPage: React.FC<MediaPageProps> = ({
  title,
  artist,
  image,
  songs,
  isPlaylist = true,
  onEdit,
  onDelete,
  renderModal
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
                ...(onDelete ? [{ label: 'Supprimer', onClick: onDelete }] : [])
              ]}
              trigger={<FontAwesomeIcon icon={faEllipsisH} className="control-icon" />}
            />
          )}
          <FontAwesomeIcon icon={faBars} className="control-icon burger-menu" />
        </div>

        <table className="song-table">
          <thead>
            <tr>
              <th>Nom</th>
              {isPlaylist && <th>Album</th>}
              {isPlaylist && <th>Artiste</th>}
              {isPlaylist && <th>Date d'ajout</th>}
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            {songs?.map((song, index) => (
              <tr key={index}>
                <td>{song.name}</td>
                {isPlaylist && <td>{song.album}</td>}
                {isPlaylist && <td>{song.artist}</td>}
                {isPlaylist && <td>{song.dateAdded}</td>}
                <td>{song.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderModal}
    </div>
  );
};

export default MediaPage;
