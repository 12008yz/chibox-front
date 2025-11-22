import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

interface User {
  id: string;
  username: string;
  level?: number;
  avatar_url?: string;
  steam_avatar?: string;
  steam_avatar_url?: string;
}

interface PlayerProps {
  user: User | null;
  size: "small" | "medium" | "large" | "extra-large";
  direction?: "row" | "column";
  showLevel?: boolean;
}

const Player: React.FC<PlayerProps> = ({
  user,
  size,
  direction = "row",
  showLevel = true
}) => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) return null;

  const truncateUsername = (username: string) => {
    const maxLength = isMobile ? 6 : 10;
    if (username.length <= maxLength) return username;
    return username.substring(0, maxLength) + '...';
  };

  return (
    <Link to={`/user/${user.id}`}>
      <div className={`flex items-center justify-center text-white transition-opacity hover:opacity-80 ${
        direction === "row" ? "gap-2 sm:gap-4" : "flex-col"
      }`}>
        <Avatar
          id={user.id}
          image={user.avatar_url}
          steamAvatar={user.steam_avatar_url || user.steam_avatar}
          size={size}
          showLevel={showLevel}
          level={user.level || 1}
        />
        <span className="mt-1 sm:mt-2 font-semibold text-center text-xs sm:text-sm md:text-base">{truncateUsername(user.username)}</span>
      </div>
    </Link>
  );
};

export default Player;
