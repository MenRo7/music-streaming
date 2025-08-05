import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { getUserMusics, getUserAlbums } from '../apis/MyMusicService';
import { usePlayer } from '../apis/PlayerContext';
import PlaylistCard from '../components/PlaylistCard';

import '../styles/MyMusicPage.css';

const MyMusicPage: React.FC = () => {
  const [musics, setMusics] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [musicData, albumData] = await Promise.all([
          getUserMusics(),
          getUserAlbums(),
        ]);

        const formattedSongs = musicData.map((music: any) => ({
          id: music.id,
          name: music.title,
          artist: music.artist_name,
          album: albumData.find((a: any) => a.id === music.album_id)?.title || 'Inconnu',
          album_image: music.image ? `/storage/${music.image}` : '',
          audio: `/storage/${music.audio}`,
          dateAdded: new Date(music.created_at).toLocaleDateString(),
          duration: '3:45',
        }));

        setMusics(formattedSongs);
        setAlbums(albumData);
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
      }
    };

    fetchData();
  }, []);

  const handlePlaySong = (song: any) => {
    if (song.audio) {
      playSong(song.audio, song.name, song.artist, song.album_image);
    }
  };

  return (
    <div className="media-content">
      <div className="media-page">
        <h2>Ma musique</h2>
        <table className="song-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Album</th>
              <th>Artiste</th>
              <th>Date d'ajout</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            {musics.map((song, index) => (
              <tr key={index} className="song-row">
                <td className="track-number-cell" onClick={() => handlePlaySong(song)}>
                  <span className="track-number">{index + 1}</span>
                  <FontAwesomeIcon icon={faPlay} className="hover-play-icon" />
                </td>
                <td>{song.name}</td>
                <td>{song.album}</td>
                <td>{song.artist}</td>
                <td>{song.dateAdded}</td>
                <td>{song.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: '40px' }}>Mes Albums</h2>
        <div className="album-row">
          {albums.map((album: any) => (
            <PlaylistCard key={album.id} title={album.title} image={album.image} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyMusicPage;
