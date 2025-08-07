import { useState, useEffect } from 'react';
import { useGetBonusStatusQuery, usePlayRouletteMutation } from '../features/user/userApi';
import Modal from './Modal';

interface RouletteGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RouletteItem {
  id: number;
  type: 'sub_1_day' | 'sub_3_days' | 'empty';
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ isOpen, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'spinning' | 'finished'>('idle');
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<string>('');
  const [showParticles, setShowParticles] = useState(false);

  const { data: bonusStatus, refetch: refetchBonusStatus } = useGetBonusStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [playRoulette, { isLoading: isPlaying }] = usePlayRouletteMutation();

  // Определяем элементы рулетки - 9 линий, только 2 с подарками
  const rouletteItems: RouletteItem[] = [
    { id: 0, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
    { id: 1, type: 'sub_1_day', label: '+1 День', color: 'text-yellow-400', bgColor: 'bg-yellow-600', icon: '⭐' },
    { id: 2, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
    { id: 3, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
    { id: 4, type: 'sub_3_days', label: '+3 Дня', color: 'text-green-400', bgColor: 'bg-green-600', icon: '💎' },
    { id: 5, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
    { id: 6, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
    { id: 7, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
    { id: 8, type: 'empty', label: 'Пусто', color: 'text-gray-400', bgColor: 'bg-gray-700', icon: '✗' },
  ];

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setGameState('idle');
      setIsSpinning(false);
      setWinnerIndex(null);
      setGameResult('');
      setShowParticles(false);
      refetchBonusStatus();
    }
  }, [isOpen, refetchBonusStatus]);

  const handleSpin = async () => {
    if (isSpinning || gameState !== 'idle' || isPlaying) return;

    setIsSpinning(true);
    setGameState('spinning');

    try {
      // Делаем запрос к API
      const response = await playRoulette().unwrap();

      const resultIndex = response.winner_index;

      // Анимация крутения рулетки
      await animateRoulette(resultIndex);

      setWinnerIndex(resultIndex);
      setGameState('finished');

      if (response.prize_type !== 'empty') {
        setGameResult(response.message || 'Поздравляем! Вы выиграли приз!');
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      } else {
        setGameResult('В этот раз не повезло. Попробуйте еще раз!');
      }

      refetchBonusStatus();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Произошла ошибка при игре';
      setGameResult(`Ошибка: ${errorMessage}`);
      setGameState('finished');
    } finally {
      setIsSpinning(false);
    }
  };



  const animateRoulette = (_targetIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      // Анимация длится 3 секунды
      setTimeout(resolve, 3000);
    });
  };

  const isAvailable = bonusStatus?.is_available;
  const timeUntilNext = bonusStatus?.time_until_next_seconds;

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl min-w-[500px]">
        {/* Particles Effect */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random() * 0.6}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎰</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Рулетка Удачи
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Крутите рулетку и выигрывайте дни подписки!
          </p>
        </div>

        {!isAvailable && gameState === 'idle' ? (
          // Бонус недоступен
          <div className="text-center space-y-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <div className="text-4xl mb-3">⏰</div>
              <div className="text-red-400 mb-2 font-medium">Рулетка недоступна</div>
              {timeUntilNext && (
                <div className="text-gray-300 text-sm">
                  Следующая игра через: <span className="font-mono text-yellow-400">{formatTimeLeft(timeUntilNext)}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200"
            >
              Закрыть
            </button>
          </div>
        ) : (
          // Игра доступна
          <div className="space-y-6">
            {/* Рулетка */}
            <div className="relative overflow-hidden rounded-2xl border-4 border-yellow-500/30 bg-gray-800/50">
              {/* Указатель */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
              </div>

              {/* Элементы рулетки */}
              <div
                className={`flex transition-transform duration-3000 ease-out ${
                  isSpinning ? 'animate-spin-roulette' : ''
                }`}
                style={{
                  transform: winnerIndex !== null && !isSpinning
                    ? `translateX(-${(winnerIndex * 80) - 200}px)`
                    : isSpinning
                    ? `translateX(-${2000 + (winnerIndex || 0) * 80}px)`
                    : 'translateX(-200px)'
                }}
              >
                {/* Дублируем элементы для бесконечной прокрутки */}
                {[...rouletteItems, ...rouletteItems, ...rouletteItems].map((item, index) => (
                  <div
                    key={`${item.id}-${Math.floor(index / 9)}`}
                    className={`
                      min-w-[80px] h-20 flex flex-col items-center justify-center border-r border-gray-600 relative
                      ${item.bgColor} ${item.color}
                      ${winnerIndex === item.id && !isSpinning ? 'ring-4 ring-yellow-400 bg-opacity-80' : ''}
                    `}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-medium text-center px-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Статус игры */}
            <div className="text-center min-h-[80px] flex flex-col items-center justify-center">
              {gameState === 'idle' && (
                <div className="space-y-2">
                  <p className="text-gray-400">Нажмите "Крутить" чтобы начать!</p>
                  <div className="text-xs text-gray-500">
                    <p>Шансы: 20% - 1 день, 10% - 3 дня, 70% - пусто</p>
                  </div>
                </div>
              )}

              {gameState === 'spinning' && (
                <div className="flex flex-col items-center gap-3 text-yellow-400">
                  <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
                  <span className="font-medium">Рулетка крутится...</span>
                </div>
              )}

              {gameState === 'finished' && gameResult && (
                <div className="space-y-3">
                  <div className="text-4xl">
                    {winnerIndex !== null && rouletteItems[winnerIndex].type !== 'empty' ? '🎉' : '😔'}
                  </div>
                  <p className={`font-medium text-lg ${
                    winnerIndex !== null && rouletteItems[winnerIndex].type !== 'empty'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {gameResult}
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки управления */}
            <div className="flex gap-3">
              {gameState === 'idle' && (
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-lg"
                >
                  🎰 Крутить рулетку!
                </button>
              )}

              <button
                onClick={onClose}
                className={`py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 ${
                  gameState === 'idle' ? 'px-8' : 'flex-1'
                }`}
              >
                {gameState === 'finished' ? 'Готово' : 'Отмена'}
              </button>
            </div>

            {/* Информация о наградах */}
            {gameState === 'idle' && (
              <div className="text-center pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-500 space-y-2">
                  <p>Возможные награды:</p>
                  <div className="flex justify-center gap-6 text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      +1 День
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-green-400">💎</span>
                      +3 Дня
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


    </Modal>
  );
};

export default RouletteGame;
