import React from 'react';
import { useTranslation } from 'react-i18next';
import Player from './Player';
import Monetary from './Monetary';

interface User {
  id: string;
  username: string;
  level?: number;
  avatar_url?: string;
  steam_avatar?: string;
  score?: number;
  cases_opened?: number;
  max_item_value?: number;
  most_expensive_item_name?: string;
}

interface TopPlayerProps {
  user: User | null;
  rank: number;
  leaderboardType?: string;
}

const TopPlayer: React.FC<TopPlayerProps> = ({ user, rank, leaderboardType }) => {
  const { t } = useTranslation();

  if (!user) return null;

  const getScore = () => {
    return user.score || user.cases_opened || user.max_item_value || 0;
  };

  const getScoreSuffix = () => {
    if (rank > 3) return ''; // Только для топ-3

    if (leaderboardType === 'cases_opened') {
      return ` ${t('leaderboard_page.cases_suffix')}`;
    } else if (leaderboardType === 'level') {
      return ` ${t('leaderboard_page.level_suffix')}`;
    }
    return '';
  };

  return (
    <div className={`relative w-40 sm:w-52 md:w-64 ${rank === 1 ? '-mt-6 sm:-mt-10' : 'hidden md:block'}`}>
      <div className='relative z-50 flex flex-col items-center justify-center'>
        <Player user={user} size="large" direction="column" showLevel={true} forceShowBorder={true} />
        <div className='flex flex-col items-center gap-1 sm:gap-2'>
          <span className='text-lg sm:text-xl md:text-2xl font-bold mt-1'>
            #{rank}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 mt-3 sm:mt-4 md:mt-6">
          <div className="text-gray-400 text-sm sm:text-base">
            {leaderboardType === 'most_expensive_item' ? (
              <Monetary value={getScore()} />
            ) : (
              <span className="font-semibold">{getScore()}{getScoreSuffix()}</span>
            )}
          </div>
          {leaderboardType === 'most_expensive_item' && user.most_expensive_item_name && (
            <span className="text-[0.65rem] sm:text-xs text-gray-400 text-center px-2 max-w-[150px] sm:max-w-[200px] truncate">
              {user.most_expensive_item_name}
            </span>
          )}
        </div>
      </div>

      {/* Простой подиум эффект */}
      <div className="absolute top-[50px] sm:top-[60px] md:top-[70px] z-0 w-full h-16 sm:h-20 md:h-24 bg-gradient-to-t from-blue-600/30 to-transparent rounded-lg" />
    </div>
  );
};

export default TopPlayer;
