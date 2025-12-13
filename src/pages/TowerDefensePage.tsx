import React, { useState } from 'react';
import TowerDefenseGame from '../components/TowerDefenseGame';
import { useGetTowerDefenseStatusQuery, useGetTowerDefenseStatisticsQuery } from '../features/user/userApi';

const TowerDefensePage: React.FC = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const { data: statusData } = useGetTowerDefenseStatusQuery();
  const { data: statsData } = useGetTowerDefenseStatisticsQuery();

  const status = statusData?.data;
  const stats = statsData?.data?.statistics;

  return (
    <div className="min-h-screen bg-[#151225] text-white p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tower Defense</h1>
          <p className="text-gray-400 text-lg">
            Защитите свою базу от волн врагов! Поставьте предмет на кон и выиграйте предмет дороже!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Статус */}
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Статус</h2>
            <div className="space-y-2">
              <p className="text-gray-400">
                Попыток осталось: <span className="text-white font-semibold">
                  {status?.attemptsLeft && status.attemptsLeft >= 999999 ? '∞ (Бесконечно)' : (status?.attemptsLeft || 0)}
                </span>
              </p>
              <p className="text-gray-400">
                Максимум попыток: <span className="text-white font-semibold">{status?.maxAttempts || 0}</span>
              </p>
              <p className="text-gray-400">
                Подписка: <span className="text-white font-semibold">
                  {status?.hasSubscription ? `Тир ${status.subscriptionTier}` : 'Нет'}
                </span>
              </p>
            </div>
            <button
              onClick={() => setIsGameOpen(true)}
              disabled={!status?.canPlay}
              className="mt-4 w-full px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Начать игру
            </button>
          </div>

          {/* Статистика */}
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Статистика</h2>
            <div className="space-y-2">
              <p className="text-gray-400">
                Всего игр: <span className="text-white font-semibold">{stats?.total_games || 0}</span>
              </p>
              <p className="text-gray-400">
                Побед: <span className="text-green-400 font-semibold">{stats?.wins || 0}</span>
              </p>
              <p className="text-gray-400">
                Поражений: <span className="text-red-400 font-semibold">{stats?.losses || 0}</span>
              </p>
              <p className="text-gray-400">
                Лучший результат: <span className="text-white font-semibold">{stats?.best_waves || 0} волн</span>
              </p>
              <p className="text-gray-400">
                Всего убито врагов: <span className="text-white font-semibold">{stats?.total_enemies_killed || 0}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Правила */}
        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Правила игры</h2>
          <ul className="space-y-2 text-gray-400">
            <li>• Выберите предмет из инвентаря для ставки</li>
            <li>• Если вы выиграете, получите предмет дороже вашей ставки</li>
            <li>• Если проиграете, предмет ставки будет потерян</li>
            <li>• Количество попыток зависит от уровня вашей подписки</li>
            <li>• Попытки обновляются каждый день в 16:00 МСК</li>
          </ul>
        </div>
      </div>

      <TowerDefenseGame
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onRewardReceived={() => {
          // Обновляем данные после получения награды
          window.location.reload();
        }}
      />
    </div>
  );
};

export default TowerDefensePage;

