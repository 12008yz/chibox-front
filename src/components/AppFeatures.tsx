import React from 'react';
import Title from './Title';
import { Link } from 'react-router-dom';
import { formatDays } from '../utils/declension';

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
  const statusTiers: StatusTier[] = [
    {
      name: 'Статус',
      price: 1210,
      days: 30,
      bonus_percentage: 3.0,
      max_daily_cases: 1,
      icon: '👑',
      color: 'from-gray-400 to-gray-600',
      badge: 'Базовый',
      features: [
        '+3% к шансу выпадения',
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
      price: 2890,
      days: 30,
      bonus_percentage: 5.0,
      max_daily_cases: 1,
      icon: '💎',
      color: 'from-blue-400 to-purple-600',
      badge: 'Популярный',
      features: [
        '+5% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        '4 попытки бонусного кейса',
        'Возможность обмена предметов',
        'Вывод предметов',
        '2 спина в день',
        'Вывод баланса'
      ],
      popular: true
    },
    {
      name: 'Статус++',
      price: 6819,
      days: 30,
      bonus_percentage: 8.0,
      max_daily_cases: 1,
      icon: '🔥',
      color: 'from-yellow-400 to-red-500',
      badge: 'Премиум',
      features: [
        '+8% к шансу выпадения',
        '1 ежедневный кейс',
        'Доступ ко всем бонусам',
        '5 попыток бонусного кейса',
        'Возможность обмена предметов',
        'Не выпадают повторные предметы',
        'Вывод предметов',
        '3 спина в день',
        'Вывод баланса',
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
            className={`group relative bg-gray-900/30 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
              tier.popular
                ? 'border-purple-500/50 hover:border-purple-400/70 ring-2 ring-purple-500/20'
                : 'border-gray-700/50 hover:border-gray-600/70'
            }`}
          >
            {/* Популярный статус */}
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  ⭐ ПОПУЛЯРНЫЙ
                </div>
              </div>
            )}

            {/* Градиентный фон при наведении */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

            {/* Бейдж */}
            <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${tier.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
              {tier.badge}
            </div>

            <div className="relative z-10">
              {/* Иконка и название */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {tier.icon}
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
                  за {formatDays(tier.days)}
                </div>
              </div>

              {/* Основные характеристики */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-center">
                  <span className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    +{tier.bonus_percentage}% бонус
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

      {/* Дополнительная информация */}
      <div className="mt-12 text-center max-w-4xl">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-3">🎯 Преимущества статусов</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Статусы дают вам доступ к эксклюзивным ежедневным кейсам и повышают ваши шансы на получение редких предметов.
            Чем выше статус, тем больше возможностей и привилегий!
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              🎁 Ежедневные кейсы
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              📈 Повышенные шансы
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              🛡️ Защита от дубликатов
            </span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
              👑 VIP привилегии
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppFeatures;
