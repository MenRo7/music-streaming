import React from 'react';
import '../styles/UserAvatar.css';

interface UserAvatarProps {
  name?: string;
  image?: string | null;
  className?: string;
  alt?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, image, className = '', alt = 'User Avatar' }) => {
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
    <>
      {image ? (
        <img
          src={image}
          alt={alt}
          className={`user-avatar ${className}`}
        />
      ) : (
        <div className={`user-avatar user-avatar-placeholder ${className}`}>
          {getInitials(name)}
        </div>
      )}
    </>
  );
};

export default UserAvatar;
