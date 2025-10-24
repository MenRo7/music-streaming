import React from 'react';
import '../styles/PlaylistCard.css';

interface PlaylistCardProps {
  title: string;
  image?: string | null;
  onClick?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, image, onClick }) => {
  return (
    <div
      className="playlist-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {image ? (
        <img src={image} alt={title} className="playlist-image" loading="lazy" decoding="async" />
      ) : (
        <div className="placeholder-image">Image</div>
      )}
      <h3 className="playlist-title">{title}</h3>
    </div>
  );
};

export default PlaylistCard;
