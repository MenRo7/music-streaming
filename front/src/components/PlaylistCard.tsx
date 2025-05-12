import React from 'react';
import '../styles/PlaylistCard.css';

interface PlaylistCardProps {
  title: string;
  image?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, image }) => {
  return (
    <div className="playlist-card">
      {image ? (
        <img src={image} alt={title} className="playlist-image" />
      ) : (
        <div className="placeholder-image">Image</div>
      )}
      <h3 className="playlist-title">{title}</h3>
    </div>
  );
};

export default PlaylistCard;

