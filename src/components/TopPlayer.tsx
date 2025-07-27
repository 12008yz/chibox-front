import React from 'react';
import Player from './Player';
import Monetary from './Monetary';

interface User {
  id: string;
  username: string;
  level?: number;
  steam_avatar?: string;
  score?: number;
  cases_opened?: number;
  max_item_value?: number;
}

interface TopPlayerProps {
  user: User | null;
  rank: number;
}

const TopPlayer: React.FC<TopPlayerProps> = ({ user, rank }) => {
  if (!user) return null;

  const getScore = () => {
    return user.score || user.cases_opened || user.max_item_value || 0;
  };

  return (
    <div className={`relative w-64 ${rank === 1 ? '-mt-10' : 'hidden md:block'}`}>
      <div className='relative z-50 flex flex-col items-center justify-center'>
        <Player user={user} size="large" direction="column" showLevel={true} />
        <div className='flex flex-col items-center gap-2'>
          <span className='text-2xl font-bold mt-1'>
            #{rank}
          </span>
        </div>
        <div className="text-gray-400 truncate mt-6">
          <Monetary value={getScore()} />
        </div>
      </div>

      {/* Простой подиум эффект */}
      <div className="absolute top-[70px] z-0 w-full h-24 bg-gradient-to-t from-blue-600/30 to-transparent rounded-lg" />
    </div>
  );
};

export default TopPlayer;
