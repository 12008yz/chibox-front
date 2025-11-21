import React from 'react';
import Title from './Title';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDaysI18n } from '../utils/declension';

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
}

interface AppFeaturesProps {
  name: string;
  description: string;
}

const AppFeatures: React.FC<AppFeaturesProps> = ({ name, description }) => {
  const { t } = useTranslation();
  const statusTiers: StatusTier[] = [
    {
      name: 'Статус',
      price: 1811,
      days: 30,
      bonus_percentage: 2.0,
      max_daily_cases: 1,
      icon: '/images/status.png',
      color: 'from-gray-400 to-gray-600',
      badge: 'Базовый',
      features: [
        '+2% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        '3 попытки бонусного кейса',
        'Возможность обмена предметов',
        'Вывод предметов',
        '1 спин в день',
      ]
    },
    {
      name: 'Статус+',
      price: 3666,
      days: 30,
      bonus_percentage: 3.0,
      max_daily_cases: 1,
      icon: '/images/status+.png',
      color: 'from-blue-400 to-purple-600',
      badge: 'Популярный',
      features: [
        '+3% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        '4 попытки бонусного кейса',
        'Возможность обмена предметов',
        'Вывод предметов',
        '2 спина в день',
      ],
      popular: true
    },
    {
      name: 'Статус++',
      price: 7580,
      days: 30,
      bonus_percentage: 5.0,
      max_daily_cases: 1,
      icon: '/images/status++.png',
      color: 'from-yellow-400 to-red-500',
      badge: 'Премиум',
      features: [
        '+5% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        '5 попыток бонусного кейса',
        'Возможность обмена предметов',
        'Не выпадают повторные предметы',
        'Вывод предметов',
        '3 спина в день',
      ]
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-[360px] md:max-w-none z-50">
      <Title title={name} />

      <div className="text-center mb-8">
        <p className="text-gray-400 text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {statusTiers.map((tier, index) => (
          <div
            key={index}
            className={`group relative bg-gray-900/40 border rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
              tier.popular
                ? 'border-purple-500/50 hover:border-purple-400/70 ring-2 ring-purple-500/20'
                : 'border-gray-700/50 hover:border-gray-600/70'
            }`}
          >

            {/* Градиентный фон при наведении */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

            {/* Бейдж */}
            <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${tier.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
              {tier.badge}
            </div>

            <div className="relative z-10">
              {/* Иконка и название */}
              <div className="text-center mb-6">
                <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <img src={tier.icon} alt={tier.name} className="w-20 h-20 object-contain" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {tier.name}
                </h3>
              </div>

              {/* Цена */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  {tier.price}₽
                </div>
                <div className="text-gray-400 text-sm">
                  за {formatDaysI18n(tier.days, t)}
                </div>
              </div>

              {/* Основные характеристики */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-center">
                  <span className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    +{tier.bonus_percentage}% {t('common.bonus_keyword')}
                  </span>
                </div>
                <div className="text-center text-gray-300 text-sm">
                  {tier.max_daily_cases} ежедневный кейс
                </div>
              </div>

              {/* Особенности */}
              <div className="space-y-2 mb-6">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Кнопка покупки */}
              <Link
                to="/profile"
                className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Купить статус
              </Link>
            </div>

            {/* Свечение */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-5 rounded-xl blur-xl transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppFeatures;
