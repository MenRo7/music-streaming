import React, { useEffect, useState } from 'react';
import { Song } from '../utils/types';
import SongCard from './SongCard';
import '../styles/SongList.css';

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetch('/api/songs')
      .then(response => response.json())
      .then(data => setSongs(data))
      .catch(error => console.error('Error fetching songs:', error));
  }, []);

  return (
    <div className="songList">
      <h2>Available Songs</h2>
      {songs.map(song => (
        <SongCard key={song._id} song={song} />
      ))}
    </div>
  );
};

export default SongList;
