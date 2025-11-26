import { useGetGlobalStatisticsQuery } from '../features/user/userApi';
import { OpponentTurnIcon, GiftIcon, GamepadIcon } from '../components/icons';
import { Package, Users, RefreshCw, Lock, Zap } from 'lucide-react';

const AboutPage = () => {
  const { data: statsData, isLoading } = useGetGlobalStatisticsQuery(undefined, {
    pollingInterval: 10000, // Обновляем каждые 10 секунд
  });

  // Форматируем числа с разделителями
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  const stats = [
    {
      icon: <Package className="w-10 h-10 md:w-12 md:h-12 text-orange-400 mx-auto" />,
      label: 'Открыто кейсов',
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalCasesOpened || 0)
    },
    {
      icon: <Users className="w-10 h-10 md:w-12 md:h-12 text-orange-400 mx-auto" />,
      label: 'Пользователей',
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalUsers || 0)
    },
    {
      icon: <RefreshCw className="w-10 h-10 md:w-12 md:h-12 text-orange-400 mx-auto" />,
      label: 'Апгрейдов',
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalUpgrades || 0)
    },
    {
      icon: <OpponentTurnIcon className="w-10 h-10 md:w-12 md:h-12 text-orange-400 mx-auto" />,
      label: 'Игр сыграно',
      value: isLoading ? '...' : formatNumber(statsData?.data?.totalGamesPlayed || 0)
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-orange-400">
          О нас
        </h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">ChiBox - Лучшая платформа для открытия кейсов</h2>
            <p className="mb-4 leading-relaxed">
              ChiBox - это современная платформа для открытия кейсов, созданная с любовью
              к играм и игровому сообществу. Мы стремимся предоставить лучший опыт открытия
              кейсов с прозрачными шансами и честной игрой.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Наша миссия</h2>
            <p className="mb-4 leading-relaxed">
              Создать самую безопасную, честную и увлекательную платформу для открытия кейсов,
              где каждый игрок может испытать удачу и получить уникальные предметы.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Почему выбирают ChiBox?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Безопасность
                </h3>
                <p>Все транзакции защищены современными методами шифрования</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Быстрота
                </h3>
                <p>Мгновенное зачисление выигрышей и быстрый вывод предметов</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400 flex items-center gap-2">
                  <GiftIcon className="w-6 h-6" />
                  Бонусы
                </h3>
                <p>Ежедневные бесплатные кейсы и щедрая система наград</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-orange-400 flex items-center gap-2">
                  <GamepadIcon className="w-6 h-6" />
                  Разнообразие
                </h3>
                <p>Широкий выбор кейсов и дополнительные мини-игры</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Наша статистика</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gray-800/80 border border-gray-700/50 hover:border-orange-500/50 transition-colors duration-300"
                >
                  <div className="text-3xl md:text-4xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Наша команда</h2>
            <p className="mb-4 leading-relaxed">
              Мы - команда энтузиастов, которые любят игры так же, как и вы.
              Наша цель - создать лучший игровой опыт и постоянно совершенствовать наш сервис
              на основе отзывов сообщества.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
