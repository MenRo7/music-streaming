import React from 'react';
import { Link } from 'react-router-dom';
import { Song } from '../utils/types';
import '../styles/SongCard.css';

interface SongCardProps {
  song: Song;
}

const SongCard: React.FC<SongCardProps> = ({ song }) => {
  return (
    <div className="songCard">
      <h3>{song.title}</h3>
      <p>{song.artist}</p>
      <Link to={`/songs/${song._id}`}>Play</Link>
    </div>
  );
};

export default SongCard;
