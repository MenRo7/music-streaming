import React from 'react';

interface ProfileCircleCardProps {
  name: string;
  image?: string;
  onClick?: () => void;
}

const ProfileCircleCard: React.FC<ProfileCircleCardProps> = ({ name, image, onClick }) => {
  return (
    <div
      className="profile-circle-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
    >
      {image ? (
        <img src={image} alt={name} className="profile-circle-img" />
      ) : (
        <div className="profile-circle-placeholder">{name?.charAt(0)?.toUpperCase() ?? 'U'}</div>
      )}
      <div className="profile-circle-name" title={name}>{name}</div>
    </div>
  );
};

export default ProfileCircleCard;
