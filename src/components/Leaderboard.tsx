import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Title from './Title';
import TopPlayer from './TopPlayer';
import Player from './Player';
import Monetary from './Monetary';

interface User {
  user_id: string;
  username: string;
  level?: number;
  steam_avatar?: string;
  score?: number;
  cases_opened?: number;
  max_item_value?: number;
  most_expensive_item_name?: string;
}

interface LeaderboardData {
  type: string;
  leaderboard: User[];
  totalItems: number;
  limit: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) {
        setLoading(false);
        setError('Требуется авторизация');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/v1/leaderboard?type=level&limit=10', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки лидерборда');
        }

        const result = await response.json();
        if (result.success) {
          setLeaderboardData(result.data);
        } else {
          throw new Error(result.message || 'Ошибка загрузки данных');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        console.error('Ошибка загрузки лидерборда:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token]);

  const getScoreValue = (user: User) => {
    return user.score || user.cases_opened || user.max_item_value || user.level || 0;
  };

  const getScoreLabel = () => {
    if (!leaderboardData) return 'Очки';

    switch (leaderboardData.type) {
      case 'level':
        return 'Уровень';
      case 'cases_opened':
        return 'Кейсов открыто';
      case 'most_expensive_item':
        return 'Самый дорогой предмет';
      default:
        return 'Очки';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center max-w-[360px] md:max-w-none z-50">
        <Title title="Leaderboard" />
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-[360px] md:max-w-none z-50">
      <Title title="Leaderboard" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
        </div>
      ) : leaderboardData && leaderboardData.leaderboard.length > 0 ? (
        <>
          {/* Топ-3 игрока */}
          <div className="flex gap-14 my-16">
            {leaderboardData.leaderboard[1] && (
              <TopPlayer
                key={leaderboardData.leaderboard[1].user_id}
                user={{
                  id: leaderboardData.leaderboard[1].user_id,
                  username: leaderboardData.leaderboard[1].username,
                  level: leaderboardData.leaderboard[1].level,
                  steam_avatar: leaderboardData.leaderboard[1].steam_avatar,
                  score: getScoreValue(leaderboardData.leaderboard[1])
                }}
                rank={2}
              />
            )}
            {leaderboardData.leaderboard[0] && (
              <TopPlayer
                key={leaderboardData.leaderboard[0].user_id}
                user={{
                  id: leaderboardData.leaderboard[0].user_id,
                  username: leaderboardData.leaderboard[0].username,
                  level: leaderboardData.leaderboard[0].level,
                  steam_avatar: leaderboardData.leaderboard[0].steam_avatar,
                  score: getScoreValue(leaderboardData.leaderboard[0])
                }}
                rank={1}
              />
            )}
            {leaderboardData.leaderboard[2] && (
              <TopPlayer
                key={leaderboardData.leaderboard[2].user_id}
                user={{
                  id: leaderboardData.leaderboard[2].user_id,
                  username: leaderboardData.leaderboard[2].username,
                  level: leaderboardData.leaderboard[2].level,
                  steam_avatar: leaderboardData.leaderboard[2].steam_avatar,
                  score: getScoreValue(leaderboardData.leaderboard[2])
                }}
                rank={3}
              />
            )}
          </div>

          {/* Таблица остальных игроков */}
          <div className="w-full overflow-x-auto max-w-4xl">
            <table className="min-w-full divide-y divide-gray-500">
              <thead className="bg-[#19172d]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ранг
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Игрок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getScoreLabel()}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#19172d]">
                {leaderboardData.leaderboard.slice(3).map((user: User, index: number) => (
                  <tr key={user.user_id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      #{index + 4}
                    </td>
                    <td className="flex p-4 items-center gap-2">
                      <Player
                        user={{
                          id: user.user_id,
                          username: user.username,
                          level: user.level,
                          steam_avatar: user.steam_avatar
                        }}
                        size="small"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {leaderboardData.type === 'most_expensive_item' ? (
                        <div className="flex flex-col">
                          <Monetary value={getScoreValue(user)} />
                          {user.most_expensive_item_name && (
                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                              {user.most_expensive_item_name}
                            </span>
                          )}
                        </div>
                      ) : leaderboardData.type === 'level' ? (
                        <span>Уровень {getScoreValue(user)}</span>
                      ) : (
                        <span>{getScoreValue(user)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-gray-400 text-center py-8">
          Нет данных для отображения
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
