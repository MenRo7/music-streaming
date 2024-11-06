import React from 'react';
import '../styles/PlaylistCard.css';

interface PlaylistCardProps {
  title: string;
  imageUrl?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, imageUrl }) => {
  return (
    <div className="playlist-card">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="playlist-image" />
      ) : (
        <div className="placeholder-image">Image</div>
      )}
      <h3 className="playlist-title">{title}</h3>
    </div>
  );
};

export default PlaylistCard;

