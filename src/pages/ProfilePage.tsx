import React from 'react';
import { useAuth } from '../store/hooks';
import SteamProfile from '../components/SteamProfile';
import Avatar from '../components/Avatar';

const ProfilePage: React.FC = () => {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-[#151225] text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-4">Профиль пользователя</h1>
          <p className="text-gray-400">Пользователь не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151225] text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>

            <div className="flex items-center gap-4 mb-6">
              <Avatar
                steamAvatar={auth.user.steam_avatar_url}
                id={auth.user.id}
                size="large"
                level={auth.user.level}
                showLevel={true}
              />
              <div>
                <h3 className="text-xl font-bold">
                  {auth.user.steam_profile?.personaname || auth.user.username}
                </h3>
                <p className="text-gray-400">{auth.user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono text-sm">{auth.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Баланс:</span>
                <span className="text-green-400 font-semibold">${auth.user.balance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Уровень:</span>
                <span className="text-blue-400 font-semibold">{auth.user.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Опыт:</span>
                <span>{auth.user.xp}</span>
              </div>
              {auth.user.xp_to_next_level && (
                <div className="flex justify-between">
                  <span className="text-gray-400">До следующего уровня:</span>
                  <span>{auth.user.xp_to_next_level} XP</span>
                </div>
              )}
            </div>

            {/* Прогресс-бар опыта */}
            {auth.user.xp_to_next_level && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Прогресс уровня</span>
                  <span>{Math.round(((auth.user.xp || 0) / ((auth.user.xp || 0) + auth.user.xp_to_next_level)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(((auth.user.xp || 0) / ((auth.user.xp || 0) + auth.user.xp_to_next_level)) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Подписка */}
          <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4">Подписка</h2>

            {auth.user.subscription_tier ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Тип подписки:</span>
                  <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {auth.user.subscription_tier}
                  </span>
                </div>
                {auth.user.subscription_days_left !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Осталось дней:</span>
                    <span className={auth.user.subscription_days_left > 7 ? 'text-green-400' : 'text-yellow-400'}>
                      {auth.user.subscription_days_left}
                    </span>
                  </div>
                )}
                {auth.user.subscription_expiry_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Истекает:</span>
                    <span>{new Date(auth.user.subscription_expiry_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">У вас нет активной подписки</p>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors">
                  Оформить подписку
                </button>
              </div>
            )}
          </div>

          {/* Статистика */}
          <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4">Статистика</h2>

            <div className="space-y-3">
              {auth.user.cases_opened_today !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Кейсов открыто сегодня:</span>
                  <span>{auth.user.cases_opened_today}</span>
                </div>
              )}
              {auth.user.max_daily_cases !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Лимит в день:</span>
                  <span>{auth.user.max_daily_cases}</span>
                </div>
              )}
              {auth.user.total_xp_earned !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Всего опыта получено:</span>
                  <span>{auth.user.total_xp_earned}</span>
                </div>
              )}
              {auth.user.successful_bonus_claims !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Бонусов получено:</span>
                  <span>{auth.user.successful_bonus_claims}</span>
                </div>
              )}
            </div>
          </div>

          {/* Steam профиль */}
          <div className="lg:col-span-2">
            <SteamProfile user={auth.user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
