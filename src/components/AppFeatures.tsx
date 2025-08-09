import React from 'react';
import Title from './Title';
import { Link } from 'react-router-dom';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
  link?: string;
  badge?: string;
}

interface AppFeaturesProps {
  name: string;
  description: string;
}

const AppFeatures: React.FC<AppFeaturesProps> = ({ name, description }) => {
  const features: Feature[] = [
    {
      icon: '👑',
      title: 'Статусы (Подписки)',
      description: 'Покупай премиум статусы для получения эксклюзивных кейсов каждый день',
      color: 'from-yellow-400 to-orange-500',
      link: '/profile',
      badge: 'Премиум'
    },
    {
      icon: '📦',
      title: 'Ежедневные кейсы',
      description: 'Получай бесплатные кейсы каждый день с активной подпиской',
      color: 'from-green-400 to-emerald-500',
      badge: 'Ежедневно'
    },
    {
      icon: '🎰',
      title: 'Рулетка',
      description: 'Испытай удачу в колесе и выигрывай время',
      color: 'from-purple-500 to-pink-500',
      badge: 'Азарт'
    },
    {
      icon: '❌⭕',
      title: 'Крестики-нолики',
      description: 'Победи в крестики-нолики и получи бонусный кейс',
      color: 'from-blue-400 to-cyan-500',
      badge: 'Бонус'
    },
    {
      icon: '💰',
      title: 'Обмен на баланс',
      description: 'Продавай предметы из инвентаря и пополняй свой баланс',
      color: 'from-emerald-400 to-teal-500',
      badge: 'Выгодно'
    },
    {
      icon: '⏰',
      title: 'Продление статуса',
      description: 'Обменивай предметы на время своего статуса',
      color: 'from-indigo-400 to-purple-500',
      badge: '+3 дня'
    },
    {
      icon: '🚀',
      title: 'Вывод в Steam',
      description: 'Выводи выигранные предметы прямо в свой Steam инвентарь',
      color: 'from-red-400 to-pink-500',
      badge: 'Steam'
    },
    {
      icon: '🍀',
      title: 'Повышение шансов',
      description: 'Увеличивай шансы на дроп редких и дорогих предметов',
      color: 'from-amber-400 to-yellow-500',
      badge: 'Удача'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-[360px] md:max-w-none z-50">
      <Title title={name} />

      <div className="text-center mb-8">
        <p className="text-gray-400 text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/70 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
          >
            {/* Градиентный фон при наведении */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

            {/* Бейдж */}
            {feature.badge && (
              <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${feature.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                {feature.badge}
              </div>
            )}

            <div className="relative z-10">
              {/* Иконка */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Заголовок */}
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                {feature.title}
              </h3>

              {/* Описание */}
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Ссылка, если есть */}
              {feature.link && (
                <Link
                  to={feature.link}
                  className="inline-block mt-4 text-sm font-medium text-transparent bg-gradient-to-r bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`
                  }}
                >
                  Подробнее →
                </Link>
              )}
            </div>

            {/* Свечение */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl blur-xl transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="mt-12 text-center max-w-4xl">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-3">🎯 Твой путь к успеху</h3>
          <p className="text-gray-300 leading-relaxed">
            Начни с бесплатных кейсов, накапливай опыт и баланс, покупай статусы для получения лучших наград.
            Играй в мини-игры, обменивай предметы и выводи лучшие скины в Steam!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              🔥 Горячие дропы
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              💯 Честная игра
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              ⚡ Быстрые выплаты
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppFeatures;
