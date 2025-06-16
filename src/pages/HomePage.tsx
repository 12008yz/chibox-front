import { Link } from 'react-router-dom';
import { useCurrentUser } from '../store/hooks';
import { useGetCaseTemplatesQuery, useGetRecentDropsQuery } from '../features/cases/casesApi';
import { Package, TrendingUp, Users, Award } from 'lucide-react';

const HomePage = () => {
  const user = useCurrentUser();
  const { data: caseTemplates } = useGetCaseTemplatesQuery();
  const { data: recentDrops } = useGetRecentDropsQuery({ limit: 5 });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">
            Добро пожаловать, {user?.username}!
          </h1>
          <p className="text-xl mb-6">
            Откройте кейсы и получите редкие предметы CS2
          </p>
          <div className="flex space-x-4">
            <Link
              to="/cases"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Открыть кейсы
            </Link>
            <Link
              to="/inventory"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Мой инвентарь
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Открыто кейсов</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Общая прибыль</p>
              <p className="text-2xl font-bold text-green-600">+1,234 ₽</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Уровень</p>
              <p className="text-2xl font-bold">{user?.level || 1}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Достижения</p>
              <p className="text-2xl font-bold">8/15</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Cases */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Популярные кейсы</h2>
          <Link
            to="/cases"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Смотреть все →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {caseTemplates?.data?.slice(0, 4).map((caseTemplate) => (
            <div key={caseTemplate.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <img
                src={caseTemplate.image_url}
                alt={caseTemplate.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{caseTemplate.name}</h3>
                <p className="text-2xl font-bold text-blue-600">{caseTemplate.price} ₽</p>
                <Link
                  to="/cases"
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
                >
                  Открыть
                </Link>
              </div>
            </div>
          )) || (
            // Skeleton loader
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Drops */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Последние дропы</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {recentDrops?.data?.map((drop, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={drop.item?.image_url || '/placeholder-item.png'}
                    alt={drop.item?.name}
                    className="w-12 h-12 rounded"
                  />
                  <div>
                    <p className="font-semibold">{drop.user?.username}</p>
                    <p className="text-sm text-gray-600">получил {drop.item?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{drop.item?.price} ₽</p>
                  <p className="text-xs text-gray-500">{drop.created_at}</p>
                </div>
              </div>
            )) || (
              <div className="p-8 text-center text-gray-500">
                <p>Пока нет последних дропов</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
