import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Song } from '../utils/types';
import '../styles/SongDetail.css';

const SongDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    fetch(`/api/songs/${id}`)
      .then(res => res.json())
      .then(data => setSong(data))
      .catch(error => console.error('Error fetching song:', error));
  }, [id]);

  if (!song) return <div>Loading...</div>;

  return (
    <div className="songDetail">
      <h2>{song.title} by {song.artist}</h2>
      <audio controls src={song.audioUrl}>
        Your browser does not support the audio element.
      </audio>
      <p>{song.description}</p>
    </div>
  );
};

export default SongDetail;
