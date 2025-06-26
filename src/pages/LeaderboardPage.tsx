import React, { useState } from 'react';
import { useGetLeaderboardQuery } from '../features/user/userApi';

type LeaderboardType = 'level' | 'cases_opened' | 'most_expensive_item';

interface SubscriptionTierProps {
  tier: number;
  daysLeft: number;
}

const SubscriptionTier: React.FC<SubscriptionTierProps> = ({ tier, daysLeft }) => {
  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 0:
        return { name: 'Без подписки', color: 'text-gray-400', bg: 'bg-gray-600' };
      case 1:
        return { name: 'Статус', color: 'text-blue-400', bg: 'bg-blue-600' };
      case 2:
        return { name: 'Статус+', color: 'text-purple-400', bg: 'bg-purple-600' };
      case 3:
        return { name: 'Статус++', color: 'text-yellow-400', bg: 'bg-yellow-600' };
      default:
        return { name: 'Неизвестно', color: 'text-gray-400', bg: 'bg-gray-600' };
    }
  };

  const tierInfo = getTierInfo(tier);

  return (
    <span className={`px-2 py-1 rounded text-xs ${tierInfo.color} ${tierInfo.bg}`}>
      {tierInfo.name}
    </span>
  );
};

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('level');

  const { data: leaderboardData, isLoading, error } = useGetLeaderboardQuery({
    type: activeTab,
    limit: 10
  });

  const tabs = [
    { id: 'level' as LeaderboardType, name: 'По уровню', icon: '🏆' },
    { id: 'cases_opened' as LeaderboardType, name: 'По кейсам', icon: '📦' },
    { id: 'most_expensive_item' as LeaderboardType, name: 'По предмету', icon: '💎' }
  ];

  const getScoreDisplay = (entry: any, type: LeaderboardType) => {
    switch (type) {
      case 'level':
        return (
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">Уровень {entry.level}</div>
            <div className="text-xs text-gray-400">{entry.total_xp_earned} XP</div>
          </div>
        );
      case 'cases_opened':
        return (
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{entry.cases_opened}</div>
            <div className="text-xs text-gray-400">кейсов</div>
          </div>
        );
      case 'most_expensive_item':
        return (
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">${entry.max_item_value?.toFixed(2) || '0.00'}</div>
            {entry.most_expensive_item_name && (
              <div className="text-xs text-gray-400 truncate max-w-32" title={entry.most_expensive_item_name}>
                {entry.most_expensive_item_name}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gambling mb-4">🏆 Таблица лидеров</h1>
          <p className="text-xl text-gray-300">
            Соревнуйтесь с другими игроками и поднимайтесь в рейтинге!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 bg-gray-800 rounded-lg p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⚡</div>
            <p className="text-gray-400">Загрузка таблицы лидеров...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-400">Ошибка загрузки таблицы лидеров</p>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboardData?.data?.leaderboard && (
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
              <h2 className="text-2xl font-bold text-center text-white">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
            </div>

            <div className="divide-y divide-gray-700">
              {leaderboardData.data.leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`p-4 hover:bg-gray-800 transition-colors ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank and User */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-2xl font-bold min-w-[60px] text-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div className="flex-1">
                        <div className="font-bold text-white text-lg">
                          {entry.username}
                        </div>
                      </div>
                    </div>

                    {/* Subscription */}
                    <div className="hidden md:block min-w-[120px]">
                      <SubscriptionTier
                        tier={entry.subscription_tier}
                        daysLeft={entry.subscription_days_left}
                      />
                    </div>

                    {/* Score */}
                    <div className="min-w-[120px]">
                      {getScoreDisplay(entry, activeTab)}
                    </div>
                  </div>

                  {/* Mobile subscription display */}
                  <div className="md:hidden mt-2 flex justify-center">
                    <SubscriptionTier
                      tier={entry.subscription_tier}
                      daysLeft={entry.subscription_days_left}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {leaderboardData?.data?.leaderboard?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏁</div>
            <p className="text-gray-400">Пока что в таблице лидеров никого нет</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gambling mb-4">ℹ️ Информация</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">🏆 По уровню</h4>
              <p>Рейтинг основан на уровне игрока и общем заработанном опыте.</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">📦 По кейсам</h4>
              <p>Рейтинг основан на количестве открытых кейсов.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">💎 По предмету</h4>
              <p>Рейтинг основан на самом дорогом предмете, выпавшем из кейса.</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-700 rounded">
            <p className="text-xs text-gray-400">
              🔄 Таблица лидеров обновляется автоматически. При одинаковых результатах порядок определяется случайно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
