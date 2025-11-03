import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCrown, FaDice, FaGamepad, FaGift, FaFire, FaChartLine, FaClock, FaCoins } from 'react-icons/fa';
import { MdCasino, MdVideogameAsset, MdTrendingUp } from 'react-icons/md';
import { RiVipCrownFill } from 'react-icons/ri';
import { GiTicTacToe } from 'react-icons/gi';
import { IoSparkles } from 'react-icons/io5';
import { formatDaysI18n } from '../utils/declension';
import Monetary from './Monetary';
import Title from './Title';
import AppFeatures from './AppFeatures';
import DepositModal from './DepositModal';

interface StatusDashboardProps {
  name: string;
  description: string;
  user?: any;
  onPlayTicTacToe?: () => void;
  onPlayRoulette?: () => void;
  onOpenSlots?: () => void;
}

interface BonusActivity {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
  cooldown?: number;
  action: () => void;
  premium?: boolean;
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({
  name,
  description,
  user,
  onPlayTicTacToe,
  onPlayRoulette,
  onOpenSlots
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('activities');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Проверяем активность подписки
  const hasActiveSubscription = user && user.subscription_tier > 0 && user.subscription_days_left > 0;

  // Если нет активной подписки, показываем стандартный компонент покупки статусов
  if (!hasActiveSubscription) {
    return <AppFeatures name={name} description={description} />;
  }

  const subscriptionTier = user.subscription_tier;
  const daysLeft = user.subscription_days_left;

  // Конфигурация статусов
  const statusConfig = {
    1: { name: t('homepage.status_tier_1'), icon: <img src="/images/status.png" alt="Статус" className="w-16 h-16 object-contain" />, color: 'from-gray-400 to-gray-600', bonus: 2 },
    2: { name: t('homepage.status_tier_2'), icon: <img src="/images/status+.png" alt="Статус+" className="w-16 h-16 object-contain" />, color: 'from-blue-400 to-purple-600', bonus: 3 },
    3: { name: t('homepage.status_tier_3'), icon: <img src="/images/status++.png" alt="Статус++" className="w-16 h-16 object-contain" />, color: 'from-yellow-400 to-red-500', bonus: 5 }
  };

  const currentStatus = statusConfig[subscriptionTier as keyof typeof statusConfig] || statusConfig[1];

  // Доступные активности
  const bonusActivities: BonusActivity[] = [
    {
      id: 'tic-tac-toe',
      name: t('tic_tac_toe.title'),
      description: t('tic_tac_toe_game.won_bonus_case'),
      icon: <img src="../../public/images/status1.png"/>,
      color: 'from-green-400 to-emerald-500',
      available: true,
      action: () => onPlayTicTacToe?.()
    },
    {
      id: 'roulette',
      name: t('games.roulette'),
      description: t('homepage.win_bonus_game'),
      icon: <img src="../../public/images/status2.png"/>,
      color: 'from-purple-400 to-pink-500',
      available: true,
      action: () => onPlayRoulette?.()
    },
    {
      id: 'slots',
      name: t('slots.title'),
      description: t('slots.description'),
      icon: <img src="../../public/images/status3.png"/>,
      color: 'from-yellow-400 to-orange-500',
      available: true,
      action: () => navigate('/slot')
    },
    {
      id: 'exchange',
      name: t('exchange.title'),
      description: t('exchange.subtitle'),
      icon: <img src="../../public/images/status4.png"/>,
      color: 'from-pink-400 to-rose-500',
      available: subscriptionTier >= 1,
      action: () => navigate('/exchange')
    }
  ];

  // Статистика пользователя
  const userStats = [
    {
      label: t('profile.cases_opened'),
      value: user.total_cases_opened || 0,
      icon: <FaGift className="text-green-400" />,
      color: 'text-green-400'
    },
    {
      label: t('common.balance'),
      value: <Monetary value={user.balance || 0} />,
      icon: <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6" />,
      color: 'text-yellow-400'
    },
    {
      label: t('public_profile.total_value'),
      value: <Monetary value={user.total_items_value || 0} />,
      icon: <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6" />,
      color: 'text-emerald-400'
    },
    {
      label: t('profile.level'),
      value: user.level || 1,
      icon: <FaChartLine className="text-blue-400" />,
      color: 'text-blue-400'
    },
    {
      label: t('time.days'),
      value: daysLeft,
      icon: <FaClock className="text-purple-400" />,
      color: 'text-purple-400'
    }
  ];

  const tabs = [
    { id: 'activities', name: t('profile.achievements'), icon: <FaGamepad /> },
    { id: 'stats', name: t('profile.statistics'), icon: <FaChartLine /> },
    { id: 'benefits', name: t('auth.bonuses'), icon: <RiVipCrownFill /> }
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-[360px] md:max-w-none z-50">
      <Title title={name} />

      <div className="text-center mb-8">
        <p className="text-gray-400 text-lg">{description}</p>
      </div>

      {/* Информация о текущем статусе */}
      <div className="w-full max-w-5xl mb-8">
        <div className={`relative bg-gradient-to-br ${currentStatus.color} p-6 rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}>
          {/* Фоновые декорации */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center justify-center">{currentStatus.icon}</div>
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  {currentStatus.name}
                  <IoSparkles className="text-yellow-300" />
                </h2>
                <p className="text-white/80 text-lg">+{currentStatus.bonus}% {t('common.bonus_keyword')}</p>
                <p className="text-white/60">{formatDaysI18n(daysLeft, t)}</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-white/80 text-sm mb-1">{t('time.days')}</div>
              <div className="text-4xl font-bold text-white">{daysLeft}</div>
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 backdrop-blur-sm"
              >
                {t('profile.purchase_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Навигационные вкладки */}
      <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-lg status-tab-active'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <div className="w-full max-w-5xl">
        {activeTab === 'activities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bonusActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={activity.available ? activity.action : undefined}
                className={`group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 status-card-hover activity-glow cursor-pointer ${
                  activity.available
                    ? 'hover:border-gray-600/70'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Градиентный фон */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                {/* Премиум бейдж */}
                {activity.premium && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full floating-badge">
                    VIP
                  </div>
                )}

                <div className="relative z-10 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${activity.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {activity.icon}
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300">
                    {activity.name}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {activity.description}
                  </p>

                  {activity.cooldown && (
                    <div className="mt-3 text-xs text-yellow-400">
                      {t('cases.available_in')}: {activity.cooldown}{t('common.minutes_short')}
                    </div>
                  )}
                </div>

                {/* Свечение */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-5 rounded-xl blur-xl transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {userStats.map((stat, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:border-gray-600/70 transition-all duration-300">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaFire className="text-orange-400" />
                {t('auth.bonuses')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{t('common.bonus_keyword')}</span>
                  <span className="text-green-400 font-bold">+{currentStatus.bonus}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{t('cases.daily_case')}</span>
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{t('tic_tac_toe.title')}</span>
                  <span className="text-purple-400 font-bold">{subscriptionTier + 2}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{t('games.roulette')}</span>
                  <span className="text-yellow-400 font-bold">{subscriptionTier}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MdTrendingUp className="text-green-400" />
                {t('profile.achievements')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <span className="text-gray-300">{t('profile.subscription')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400">✓</span>
                  </div>
                  <span className="text-gray-300">{t('auth.bonuses')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400">✓</span>
                  </div>
                  <span className="text-gray-300">VIP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
};

export default StatusDashboard;
