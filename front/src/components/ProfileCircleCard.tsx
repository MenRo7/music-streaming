import React from 'react';

interface ProfileCircleCardProps {
  name: string;
  image?: string;
  onClick?: () => void;
}

const ProfileCircleCard: React.FC<ProfileCircleCardProps> = ({ name, image, onClick }) => {
  const getInitials = (fullName?: string): string => {
    if (!fullName) return 'U';

    const names = fullName.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    // Première lettre du prénom + première lettre du nom
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div
      className="profile-circle-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
    >
      {image ? (
        <img src={image} alt={name} className="profile-circle-img" loading="lazy" decoding="async" />
      ) : (
        <div className="profile-circle-placeholder">{getInitials(name)}</div>
      )}
      <div className="profile-circle-name" title={name}>{name}</div>
    </div>
  );
};

export default ProfileCircleCard;
