import React from 'react';
import Title from './Title';
import { useTranslation } from 'react-i18next';
import { formatDaysI18n } from '../utils/declension';
import {
  TrendingUp,
  Gift,
  Star,
  Grid3X3,
  KeyRound,
  Dices,
  ArrowLeftRight,
  Package,
  ShieldCheck,
  Check,
} from 'lucide-react';

const iconSize = 16;

function getFeatureIcon(feature: string) {
  if (feature.includes('шансу выпадения')) return <TrendingUp size={iconSize} className="text-emerald-400 shrink-0" />;
  if (feature.includes('ежедневный кейс')) return <Gift size={iconSize} className="text-amber-400 shrink-0" />;
  if (feature.includes('бонусам')) return <Star size={iconSize} className="text-yellow-400 shrink-0" />;
  if (feature.includes('Крестики')) return <Grid3X3 size={iconSize} className="text-cyan-400 shrink-0" />;
  if (feature.includes('сейфа')) return <KeyRound size={iconSize} className="text-orange-400 shrink-0" />;
  if (feature.includes('Слот')) return <Dices size={iconSize} className="text-purple-400 shrink-0" />;
  if (feature.includes('обмена')) return <ArrowLeftRight size={iconSize} className="text-blue-400 shrink-0" />;
  if (feature.includes('Вывод')) return <Package size={iconSize} className="text-green-400 shrink-0" />;
  if (feature.includes('повторные')) return <ShieldCheck size={iconSize} className="text-indigo-400 shrink-0" />;
  return <Check size={iconSize} className="text-green-400 shrink-0" />;
}

interface StatusTier {
  name: string;
  price: number;
  days: number;
  bonus_percentage: number;
  max_daily_cases: number;
  icon: string;
  color: string;
  badge: string;
  features: string[];
  popular?: boolean;
  id: number;
}

interface AppFeaturesProps {
  name: string;
  description: string;
}

const AppFeatures: React.FC<AppFeaturesProps> = ({ name, description }) => {
  const { t } = useTranslation();
  const statusTiers: StatusTier[] = [
    {
      id: 1,
      name: 'Статус',
      price: 1911,
      days: 30,
      bonus_percentage: 2.0,
      max_daily_cases: 1,
      icon: '/images/status.webp',
      color: 'from-gray-400 to-gray-600',
      badge: 'Базовый',
      features: [
        '+2% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        'Крестики-нолики',
        'Взлом сейфа',
        'Слот-машина',
        'Возможность обмена предметов',
        'Вывод предметов',
      ]
    },
    {
      id: 2,
      name: 'Статус+',
      price: 3499,
      days: 30,
      bonus_percentage: 3.0,
      max_daily_cases: 1,
      icon: '/images/status+.webp',
      color: 'from-blue-400 to-purple-600',
      badge: 'Популярный',
      features: [
        '+3% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        'Крестики-нолики',
        'Взлом сейфа',
        'Слот-машина',
        'Возможность обмена предметов',
        'Вывод предметов',
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Статус++',
      price: 6310,
      days: 30,
      bonus_percentage: 5.0,
      max_daily_cases: 1,
      icon: '/images/status++.webp',
      color: 'from-yellow-400 to-red-500',
      badge: 'Премиум',
      features: [
        '+5% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        'Крестики-нолики',
        'Взлом сейфа',
        'Слот-машина',
        'Возможность обмена предметов',
        'Не выпадают повторные предметы',
        'Вывод предметов',
      ]
    }
  ];

  const openSubscriptionDeposit = (tierId: number) => {
    window.dispatchEvent(new CustomEvent('openDepositModal', { detail: { tab: 'subscription', subscriptionId: tierId } }));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full z-50">
      <Title title={name} />

      <div className="text-center mb-6 md:mb-8 px-3">
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-8 w-full max-w-5xl overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide px-2 md:px-0 pb-2 md:pb-0">
        {statusTiers.map((tier, index) => (
          <div
            key={index}
            className={`group relative shrink-0 w-[78vw] max-w-[300px] md:w-auto md:max-w-none snap-center bg-gray-900/40 border rounded-xl p-4 md:p-6 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
              tier.popular
                ? 'border-purple-500/50 hover:border-purple-400/70 ring-2 ring-purple-500/20'
                : 'border-gray-700/50 hover:border-gray-600/70'
            }`}
          >

            {/* Градиентный фон при наведении */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

            {/* Бейдж */}
            <div className={`absolute top-2 right-2 bg-gradient-to-r ${tier.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
              {tier.badge}
            </div>

            <div className="relative z-10">
              {/* Иконка и название */}
              <div className="text-center mb-4 md:mb-6">
                <div className="mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <img loading="lazy" src={tier.icon} alt={tier.name} width="80" height="80" className="w-20 h-20 object-contain" />
                </div>
                <h3 className="text-white font-bold text-xl md:text-2xl mb-1.5 md:mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {tier.name}
                </h3>
              </div>

              {/* Цена */}
              <div className="text-center mb-4 md:mb-6">
                <div className="flex items-center justify-center text-2xl md:text-3xl font-bold text-white mb-1 gap-1">
                  {tier.price}
                  <img loading="lazy" src="/images/chiCoinFull.webp" alt="ChiCoins" className="w-10 h-10 inline-block object-contain align-middle self-center" width="40" height="40" />
                </div>
                <div className="text-gray-400 text-xs md:text-sm">
                  за {formatDaysI18n(tier.days, t)}
                </div>
              </div>

              {/* Основные характеристики */}
              <div className="mb-4 md:mb-6 space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-center">
                  <span className={`text-base md:text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    +{tier.bonus_percentage}% {t('common.bonus_keyword')}
                  </span>
                </div>
                <div className="text-center text-gray-300 text-xs md:text-sm">
                  {tier.max_daily_cases} ежедневный кейс
                </div>
              </div>

              {/* Особенности — главные привилегии статуса */}
              <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 flex flex-col items-center text-center">
                {tier.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-start justify-center gap-2 text-xs md:text-sm font-medium text-gray-200 py-1.5 md:py-2 px-2.5 md:px-3 rounded-lg bg-gray-800/50 border border-gray-700/50 w-full max-w-[240px]"
                  >
                    <span className="mt-0.5 flex-shrink-0">{getFeatureIcon(feature)}</span>
                    <span className="leading-snug flex-1 min-w-0 text-center">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Кнопка покупки */}
              <button
                onClick={() => {
                  openSubscriptionDeposit(tier.id);
                }}
                className={`block w-full text-center py-2.5 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Купить статус
              </button>
            </div>

            {/* Свечение */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AppFeatures;
