import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetTowerDefenseStatusQuery,
  useCreateTowerDefenseGameMutation,
  useCompleteTowerDefenseGameMutation,
  useGetUserInventoryQuery
} from '../features/user/userApi';
import { soundManager } from '../utils/soundManager';
import { X } from 'lucide-react';
import type { UserInventoryItem } from '../types/api';

interface TowerDefenseGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardReceived?: () => void;
}

const TowerDefenseGame: React.FC<TowerDefenseGameProps> = ({ isOpen, onClose, onRewardReceived }) => {
  const { t } = useTranslation();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [rewardItem, setRewardItem] = useState<any>(null);

  const { data: statusData, refetch: refetchStatus } = useGetTowerDefenseStatusQuery(undefined, {
    skip: !isOpen,
  });

  const { data: inventoryData } = useGetUserInventoryQuery(
    { page: 1, limit: 100, status: 'inventory' },
    { skip: !showItemSelection }
  );

  const [createGame, { isLoading: isCreatingGame }] = useCreateTowerDefenseGameMutation();
  const [completeGame, { isLoading: isCompletingGame }] = useCompleteTowerDefenseGameMutation();

  const status = statusData?.data;
  const currentGame = status?.currentGame;
  const canPlay = status?.canPlay ?? false;
  const attemptsLeft = status?.attemptsLeft ?? 0;

  // Получаем предметы из инвентаря для выбора ставки
  const availableItems = inventoryData?.data?.items?.filter(
    (item: UserInventoryItem) => item.item_type === 'item' && item.status === 'inventory'
  ) || [];

  useEffect(() => {
    if (isOpen) {
      refetchStatus();
      setSelectedItemId(null);
      setShowItemSelection(false);
      setGameResult(null);
      setRewardItem(null);
    }
  }, [isOpen, refetchStatus]);

  const handleStartGame = () => {
    if (!canPlay) {
      return;
    }
    setShowItemSelection(true);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleConfirmBet = async () => {
    if (!selectedItemId) return;

    try {
      const result = await createGame({ inventoryItemId: selectedItemId }).unwrap();
      if (result.success) {
        setShowItemSelection(false);
        setRewardItem(result.data.rewardItem);
        // Здесь должна быть логика запуска самой игры tower defense
        // Пока что симулируем завершение игры через 5 секунд
        setTimeout(() => {
          handleCompleteGame(result.data.game.id, true);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Ошибка создания игры:', error);
    }
  };

  const handleCompleteGame = async (gameId: string, won: boolean) => {
    try {
      const result = await completeGame({
        gameId,
        wavesCompleted: won ? 10 : 5,
        enemiesKilled: won ? 50 : 20,
        towersBuilt: won ? 8 : 4,
        result: won ? 'win' : 'lose'
      }).unwrap();

      if (result.success) {
        setGameResult(result.data.game.result);
        if (result.data.rewardItem) {
          setRewardItem(result.data.rewardItem);
        }

        if (result.data.game.result === 'win') {
          soundManager.play('win');
          setTimeout(() => {
            if (onRewardReceived) {
              onRewardReceived();
            }
            onClose();
          }, 3000);
        } else {
          soundManager.play('gameOver');
        }

        refetchStatus();
      }
    } catch (error: any) {
      console.error('Ошибка завершения игры:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#1a1a2e] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Tower Defense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {showItemSelection ? (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Выберите предмет для ставки
            </h3>
            <p className="text-gray-400 mb-4">
              Если вы выиграете, вы получите предмет дороже вашей ставки!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto mb-4">
              {availableItems.map((item: UserInventoryItem) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedItemId === item.id
                      ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {item.item?.image_url && (
                    <img
                      src={item.item.image_url}
                      alt={item.item.name}
                      className="w-full h-24 object-contain mb-2"
                    />
                  )}
                  <p className="text-sm text-white truncate">{item.item?.name}</p>
                  <p className="text-xs text-gray-400">
                    {parseFloat(item.item?.price || '0').toFixed(2)} ₽
                  </p>
                </button>
              ))}
            </div>

            {availableItems.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                У вас нет предметов в инвентаре для ставки
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowItemSelection(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmBet}
                disabled={!selectedItemId || isCreatingGame}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingGame ? 'Создание игры...' : 'Начать игру'}
              </button>
            </div>
          </div>
        ) : currentGame ? (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Игра в процессе
            </h3>
            <p className="text-gray-400 mb-4">
              Волны: {currentGame.waves_completed} / {currentGame.total_waves}
            </p>
            <p className="text-gray-400 mb-4">
              Убито врагов: {currentGame.enemies_killed}
            </p>
            <p className="text-gray-400 mb-4">
              Построено башен: {currentGame.towers_built}
            </p>
            <p className="text-yellow-400 text-sm">
              ⚠️ Здесь должна быть реализация самой игры Tower Defense
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Для полноценной игры нужно интегрировать игровой движок (например, Phaser.js как в референсной игре)
            </p>
          </div>
        ) : gameResult ? (
          <div className="text-center">
            <h3 className={`text-2xl font-bold mb-4 ${
              gameResult === 'win' ? 'text-green-400' : 'text-red-400'
            }`}>
              {gameResult === 'win' ? 'Победа!' : 'Поражение'}
            </h3>
            {gameResult === 'win' && rewardItem && (
              <div className="mb-4">
                <p className="text-white mb-2">Вы получили предмет-награду:</p>
                <div className="inline-block p-4 bg-purple-900 rounded-lg">
                  {rewardItem.image_url && (
                    <img
                      src={rewardItem.image_url}
                      alt={rewardItem.name}
                      className="w-32 h-32 object-contain mx-auto mb-2"
                    />
                  )}
                  <p className="text-white font-semibold">{rewardItem.name}</p>
                  <p className="text-green-400">
                    {parseFloat(rewardItem.price.toString()).toFixed(2)} ₽
                  </p>
                </div>
              </div>
            )}
            {gameResult === 'lose' && (
              <p className="text-gray-400">
                Предмет ставки потерян. Попробуйте снова!
              </p>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Статус игры
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">
                  Попыток осталось: {attemptsLeft >= 999999 ? '∞ (Бесконечно)' : attemptsLeft}
                </p>
                <p className="text-gray-400">Максимум попыток: {status?.maxAttempts || 0}</p>
              </div>

              {!canPlay && (
                <p className="text-red-400">
                  У вас нет доступных попыток. Попробуйте позже.
                </p>
              )}

              <button
                onClick={handleStartGame}
                disabled={!canPlay || isCreatingGame}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingGame ? 'Создание игры...' : 'Начать новую игру'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TowerDefenseGame;

