import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGamepad, FaGift, FaFire, FaChartLine, FaClock, FaCoins, FaTrophy } from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import { RiVipCrownFill } from 'react-icons/ri';
// import { GiTicTacToe } from 'react-icons/gi';
import { IoSparkles } from 'react-icons/io5';
import { formatDaysI18n } from '../utils/declension';
import Monetary from './Monetary';
import Title from './Title';
import AppFeatures from './AppFeatures';
import DepositModal from './DepositModal';
import { ReceivedIcon } from './icons';

interface StatusDashboardProps {
  name: string;
  description: string;
  user?: any;
  openedCasesCount?: number;
  onPlayTicTacToe?: () => void;
  onPlaySafeCracker?: () => void;
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
  openedCasesCount = 0,
  onPlayTicTacToe,
  onPlaySafeCracker,
  // onOpenSlots
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
    1: { name: t('homepage.status_tier_1'), icon: <img src="/images/status.png" alt="Статус" className="w-full h-full object-contain" />, color: 'from-gray-400 to-gray-600', bonus: 2 },
    2: { name: t('homepage.status_tier_2'), icon: <img src="/images/status+.png" alt="Статус+" className="w-full h-full object-contain" />, color: 'from-blue-400 to-purple-600', bonus: 3 },
    3: { name: t('homepage.status_tier_3'), icon: <img src="/images/status++.png" alt="Статус++" className="w-full h-full object-contain" />, color: 'from-yellow-400 to-red-500', bonus: 5 }
  };

  const currentStatus = statusConfig[subscriptionTier as keyof typeof statusConfig] || statusConfig[1];

  // Количество попыток в зависимости от уровня подписки

  // Доступные активности
  const bonusActivities: BonusActivity[] = [
    {
      id: 'tic-tac-toe',
      name: t('tic_tac_toe.title'),
      description: `Выиграй бонусный кейс`,
      icon: <img src="/images/status1.png" alt="Крестики-нолики" className="w-full h-full object-contain"/>,
      color: '',
      available: true,
      action: () => onPlayTicTacToe?.()
    },
    {
      id: 'safe-cracker',
      name: 'Взлом сейфа',
      description: `Подбери код и получи награду`,
      icon: <img src="/images/bonus-safe.png" alt="Сейф" className="w-full h-full object-contain"/>,
      color: '',
      available: true,
      action: () => onPlaySafeCracker?.()
    },
    {
      id: 'slots',
      name: t('slots.title'),
      description: `Испытай удачу в слоте`,
      icon: <img src="/images/status3.png" alt="Слот-машина" className="w-full h-full object-contain"/>,
      color: '',
      available: true,
      action: () => navigate('/slot')
    },
    {
      id: 'exchange',
      name: t('exchange.title'),
      description: t('exchange.subtitle'),
      icon: <img src="/images/status4.png" alt="Обмен предметов" className="w-full h-full object-contain"/>,
      color: '',
      available: subscriptionTier >= 1,
      action: () => navigate('/exchange')
    }
  ];

  // Статистика пользователя
  const userStats = [
    {
      label: t('profile.cases_opened'),
      value: openedCasesCount,
      icon: <FaGift className="text-green-400" />,
      color: 'text-green-400'
    },
    {
      label: t('common.balance'),
      value: <Monetary value={user.balance || 0} />,
      icon: <FaCoins className="text-yellow-400" />,
      color: 'text-yellow-400'
    },
    {
      label: t('public_profile.total_value'),
      value: <Monetary value={user.total_items_value || 0} />,
      icon: <FaTrophy className="text-emerald-400" />,
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
    <div className="flex flex-col items-center justify-center w-full max-w-full md:max-w-none px-4 md:px-0 z-50">
      <Title title={name} />

      <div className="text-center mb-4 md:mb-8">
        <p className="text-gray-400 text-sm md:text-lg">{description}</p>
      </div>

      {/* Информация о текущем статусе */}
      <div className="w-full max-w-5xl mb-6 md:mb-8">
        <div className={`relative bg-gradient-to-br ${currentStatus.color} p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}>
          {/* Фоновые декорации */}
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between w-full">
            <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-0 w-full md:w-auto">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                {currentStatus.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-3xl font-bold text-white flex items-center gap-1 md:gap-2">
                  {currentStatus.name}
                  <IoSparkles className="text-yellow-300 text-sm md:text-base" />
                </h2>
                <p className="text-white/80 text-sm md:text-lg">+{currentStatus.bonus}% {t('common.bonus_keyword')}</p>
                <p className="text-white/60 text-xs md:text-base">{formatDaysI18n(daysLeft, t)}</p>
              </div>
            </div>

            <div className="text-left md:text-right w-full md:w-auto flex flex-col items-start md:items-end">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="mt-2 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 w-full md:w-auto"
              >
                {t('profile.purchase_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Навигационные вкладки */}
      <div className="flex space-x-1 mb-6 md:mb-8 bg-gray-800/60 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-lg status-tab-active'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="text-sm md:text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <div className="w-full max-w-5xl">
        {activeTab === 'activities' && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {bonusActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={activity.available ? activity.action : undefined}
                className={`group relative bg-gray-900/60 border border-gray-700/50 rounded-lg md:rounded-xl p-3 md:p-6 status-card-hover activity-glow cursor-pointer ${
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
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${activity.color} mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
                      {activity.icon}
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-sm md:text-lg mb-1 md:mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300">
                    {activity.name}
                  </h3>

                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    {activity.description}
                  </p>

                  {activity.cooldown && (
                    <div className="mt-2 md:mt-3 text-xs text-yellow-400">
                      {t('cases.available_in')}: {activity.cooldown}{t('common.minutes_short')}
                    </div>
                  )}
                </div>

                {/* Свечение */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
            {userStats.map((stat, index) => (
              <div key={index} className="bg-gray-900/60 border border-gray-700/50 rounded-lg md:rounded-xl p-3 md:p-6 text-center hover:border-gray-600/70 transition-all duration-300">
                <div className="flex justify-center mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-800/50 flex items-center justify-center text-sm md:text-base">
                    {stat.icon}
                  </div>
                </div>
                <div className={`text-lg md:text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <FaFire className="text-orange-400 text-sm md:text-base" />
                {t('auth.bonuses')}
              </h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs md:text-base">{t('modals.drop_chance_bonus')}</span>
                  <span className="text-green-400 font-bold text-sm md:text-base">+{currentStatus.bonus}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs md:text-base">{t('cases.daily_case')}</span>
                  <span className="text-blue-400 font-bold text-sm md:text-base">1 {t('modals.case_per_day')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs md:text-base">{t('tic_tac_toe.title')}</span>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-purple-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs md:text-base">Взлом сейфа</span>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-yellow-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs md:text-base">{t('slots.title')}</span>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-cyan-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs md:text-base">{t('modals.item_withdrawal')}</span>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-green-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
                {subscriptionTier === 3 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs md:text-base">{t('modals.no_case_duplicates')}</span>
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <ReceivedIcon className="text-purple-400 w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <MdTrendingUp className="text-green-400 text-sm md:text-base" />
                {t('modals.all_bonuses_access')}
              </h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-green-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span className="text-gray-300 text-xs md:text-base">{t('tic_tac_toe.title')}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-yellow-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span className="text-gray-300 text-xs md:text-base">Взлом сейфа</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-cyan-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span className="text-gray-300 text-xs md:text-base">{t('slots.title')}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-blue-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span className="text-gray-300 text-xs md:text-base">{t('exchange.title')}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <ReceivedIcon className="text-purple-400 w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span className="text-gray-300 text-xs md:text-base">{t('modals.item_withdrawal')}</span>
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
