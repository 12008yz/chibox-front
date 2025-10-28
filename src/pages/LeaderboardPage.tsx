import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import Title from '../components/Title';
import TopPlayer from '../components/TopPlayer';
import Player from '../components/Player';
import Monetary from '../components/Monetary';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import { BACKGROUNDS } from '../utils/config';

interface User {
  user_id: string;
  username: string;
  level?: number;
  steam_avatar?: string;
  steam_avatar_url?: string;
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

type LeaderboardType = 'cases_opened' | 'level' | 'most_expensive_item';

interface TabConfig {
  id: LeaderboardType;
  name: string;
  description: string;
  icon: string;
}

const LeaderboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('cases_opened');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  const tabs: TabConfig[] = [
    {
      id: 'cases_opened',
      name: t('leaderboard_page.cases_opened_tab'),
      description: t('leaderboard_page.cases_opened_description'),
      icon: '📦'
    },
    {
      id: 'level',
      name: t('leaderboard_page.level_tab'),
      description: t('leaderboard_page.level_description'),
      icon: '⭐'
    },
    {
      id: 'most_expensive_item',
      name: t('leaderboard_page.best_drop_tab'),
      description: t('leaderboard_page.best_drop_description'),
      icon: '💎'
    }
  ];

  const fetchLeaderboard = async (type: LeaderboardType) => {
    if (!token) {
      setLoading(false);
      setError(t('leaderboard_page.auth_required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/v1/leaderboard?type=${type}&limit=10`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(t('leaderboard_page.leaderboard_error'));
      }

      const result = await response.json();
      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        throw new Error(result.message || t('leaderboard_page.data_error'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('leaderboard_page.data_error'));
      console.error('Ошибка загрузки лидерборда:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, token]);

  const handleTabChange = (tabId: LeaderboardType) => {
    setActiveTab(tabId);
  };

  const getScoreValue = (user: User) => {
    return user.score || user.cases_opened || user.max_item_value || user.level || 0;
  };

  const getScoreLabel = () => {
    if (!leaderboardData) return t('leaderboard_page.score_label');

    switch (leaderboardData.type) {
      case 'level':
        return t('leaderboard_page.level_label');
      case 'cases_opened':
        return t('leaderboard_page.cases_opened_label');
      case 'most_expensive_item':
        return t('leaderboard_page.most_expensive_item_label');
      default:
        return t('leaderboard_page.score_label');
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <ScrollToTopOnMount />

      {/* Фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0a0f]">
        <img
          src={BACKGROUNDS.leaderboard}
          alt=""
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
          style={{
            opacity: 0.3,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center max-w-[360px] md:max-w-none mx-auto">
          <Title title={t('leaderboard_page.title')} />

          {/* Описание текущей вкладки */}
          {currentTab && (
            <div className="text-center mb-8">
              <div className="text-4xl mb-2">{currentTab.icon}</div>
              <p className="text-gray-400">{currentTab.description}</p>
            </div>
          )}

          {/* Вкладки */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 w-full max-w-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  relative px-6 py-3 rounded-lg font-medium transition-all duration-300 flex-1 min-w-[140px]
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm">{tab.name}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {error ? (
            <div className="text-red-500 text-center bg-red-500/10 p-4 rounded-lg">
              {error}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner" />
              <span className="ml-4">{t('leaderboard_page.loading_data')}</span>
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
                    leaderboardType={leaderboardData.type}
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
                    leaderboardType={leaderboardData.type}
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
                    leaderboardType={leaderboardData.type}
                  />
                )}
              </div>

              {/* Таблица остальных игроков */}
              <div className="w-full overflow-x-auto max-w-4xl">
                <div className="bg-gray-900/30 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-500">
                    <thead className="bg-[#19172d]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('leaderboard_page.rank')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('leaderboard_page.player')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getScoreLabel()}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#19172d]">
                      {leaderboardData.leaderboard.slice(3).map((user: User, index: number) => (
                        <tr key={user.user_id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                            #{index + 4}
                          </td>
                          <td className="flex p-4 items-center gap-2">
                            <Player
                              user={{
                                id: user.user_id,
                                username: user.username,
                                level: user.level,
                                steam_avatar: user.steam_avatar,
                                steam_avatar_url: user.steam_avatar_url
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
                              <span>{t('leaderboard_page.level_prefix', { level: getScoreValue(user) })}</span>
                            ) : (
                              <span>{getScoreValue(user)}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center py-8 bg-gray-900/30 rounded-lg">
              {t('leaderboard_page.no_data')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
