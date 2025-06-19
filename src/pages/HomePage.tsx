import { Link } from 'react-router-dom';
import { useCurrentUser } from '../store/hooks';
import { useGetCaseTemplatesQuery, useGetRecentDropsQuery } from '../features/cases/casesApi';

const HomePage = () => {
  const user = useCurrentUser();
  const { data: caseTemplates } = useGetCaseTemplatesQuery();
  const { data: recentDrops } = useGetRecentDropsQuery({ limit: 5 });

  const featuredGames = [
    { name: 'Cases', icon: '🎁', path: '/cases', color: 'text-yellow-400', bg: 'from-yellow-600 to-orange-600' },
    { name: 'Crash', icon: '📈', path: '/crash', color: 'text-green-400', bg: 'from-green-600 to-emerald-600' },
    { name: 'Mines', icon: '💣', path: '/mines', color: 'text-red-400', bg: 'from-red-600 to-pink-600' },
    { name: 'Tower', icon: '🏗️', path: '/tower', color: 'text-purple-400', bg: 'from-purple-600 to-indigo-600' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl p-8 md:p-12 bg-pattern">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gambling">Welcome to ChiBox</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {user ? `Добро пожаловать, ${user.username}!` : 'Лучшая gambling платформа'}
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Откройте кейсы, играйте в захватывающие игры и выигрывайте дорогие скины CS2
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/cases" className="btn-gambling text-center">
              🎁 Открыть кейсы
            </Link>
            <Link to="/crash" className="btn-secondary text-center">
              📈 Играть в Crash
            </Link>
          </div>
        </div>
        <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">
          ⚡
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="card-gambling p-6 text-center">
          <div className="text-3xl mb-2">🎁</div>
          <p className="text-sm text-gray-400 mb-1">Кейсов открыто</p>
          <p className="text-2xl font-bold text-yellow-400">1,337</p>
        </div>

        <div className="card-gambling p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-sm text-gray-400 mb-1">Общие выигрыши</p>
          <p className="text-2xl font-bold text-green-400">$45,230</p>
        </div>

        <div className="card-gambling p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm text-gray-400 mb-1">Игроков онлайн</p>
          <p className="text-2xl font-bold text-blue-400">8,942</p>
        </div>

        <div className="card-gambling p-6 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-sm text-gray-400 mb-1">Ваш уровень</p>
          <p className="text-2xl font-bold text-purple-400">{user?.level || 1}</p>
        </div>
      </div>

      {/* Featured Games */}
      <div>
        <h2 className="text-3xl font-bold text-gambling mb-6">🎮 Популярные игры</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames.map((game) => (
            <Link key={game.path} to={game.path} className="group">
              <div className={`card-gambling p-6 text-center hover:scale-105 transition-all duration-300 bg-gradient-to-br ${game.bg} hover:shadow-2xl`}>
                <div className="text-4xl mb-3 group-hover:animate-bounce">{game.icon}</div>
                <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                <p className="text-gray-300 text-sm mb-4">Играйте и выигрывайте</p>
                <div className="btn-gambling w-full">Играть</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Cases */}
      {caseTemplates?.data && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gambling">📦 Популярные кейсы</h2>
            <Link to="/cases" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Смотреть все →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseTemplates.data.slice(0, 4).map((caseTemplate) => (
              <div key={caseTemplate.id} className="card-gambling overflow-hidden hover:scale-105 transition-all duration-300 group">
                <div className="relative">
                  <img
                    src={caseTemplate.image_url}
                    alt={caseTemplate.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 text-white">{caseTemplate.name}</h3>
                  <p className="text-2xl font-bold text-gambling mb-3">${caseTemplate.price}</p>
                  <Link to="/cases" className="btn-gambling w-full text-center block">
                    Открыть кейс
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Drops */}
      <div>
        <h2 className="text-3xl font-bold text-gambling mb-6">🔥 Последние дропы</h2>
        <div className="card-gambling overflow-hidden">
          <div className="divide-y divide-gray-700">
            {recentDrops?.data?.map((drop, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={drop.item?.image_url || '/placeholder-item.png'}
                    alt={drop.item?.name}
                    className="w-12 h-12 rounded border-2 border-gray-600"
                  />
                  <div>
                    <p className="font-semibold text-white">{drop.user?.username}</p>
                    <p className="text-sm text-gray-400">выиграл <span className="text-yellow-400">{drop.item?.name}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gambling">${drop.item?.price}</p>
                  <p className="text-xs text-gray-500">{drop.created_at}</p>
                </div>
              </div>
            )) || (
              // Placeholder drops for demo
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      🔫
                    </div>
                    <div>
                      <p className="font-semibold text-white">Player{index + 1}</p>
                      <p className="text-sm text-gray-400">выиграл <span className="text-yellow-400">AK-47 Redline</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gambling">${Math.floor(Math.random() * 500) + 50}</p>
                    <p className="text-xs text-gray-500">только что</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 rounded-2xl p-8 text-center bg-pattern">
        <h2 className="text-3xl font-bold text-gambling mb-4">Готовы начать играть?</h2>
        <p className="text-xl text-gray-300 mb-6">
          Присоединяйтесь к тысячам игроков и выигрывайте ценные предметы
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-gambling">
            🚀 Зарегистрироваться
          </Link>
          <Link to="/cases" className="btn-secondary">
            🎁 Смотреть кейсы
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
