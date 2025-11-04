import React from 'react';
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
  if (!user) return null;

  return (
    <Link to={`/user/${user.id}`}>
      <div className={`flex items-center justify-center text-white transition-opacity hover:opacity-80 ${
        direction === "row" ? "gap-4" : "flex-col"
      }`}>
        <Avatar
          id={user.id}
          image={user.avatar_url}
          steamAvatar={user.steam_avatar_url || user.steam_avatar}
          size={size}
          showLevel={showLevel}
          level={user.level || 1}
        />
        <span className="mt-2 font-semibold text-center">{user.username}</span>
      </div>
    </Link>
  );
};

export default Player;
