import React from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRandom, faEllipsisH, faBars } from '@fortawesome/free-solid-svg-icons'; 
import '../styles/PlaylistPage.css';

import { playlists } from '../utils/constants';

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playlistId = parseInt(id || '', 10);
  const playlist = playlists[playlistId-1];

  if (!playlist) {
      return <div className="playlist-page">Playlist not found</div>;
  }

  return (
    <div className='main-content'>
      <div className="playlist-page">
        <div className="playlist-header">
            <img className="playlist-page-image" src={playlist.imageUrl} alt={playlist.title} />
            <h1>{playlist.title}</h1>
        </div>

        <div className="playlist-controls">
          <FontAwesomeIcon icon={faPlay} className="control-icon" />
          <FontAwesomeIcon icon={faRandom} className="control-icon" />
          <FontAwesomeIcon icon={faEllipsisH} className="control-icon" />
          <FontAwesomeIcon icon={faBars} className="control-icon burger-menu" />
        </div>

        <table className="song-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Album</th>
              <th>Artiste</th>
              <th>Date d'ajout</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            {playlist.songs.map((song, index) => (
              <tr key={index}>
                <td>{song.name}</td>
                <td>{song.album}</td>
                <td>{song.artist}</td>
                <td>{song.dateAdded}</td>
                <td>{song.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlaylistPage;
