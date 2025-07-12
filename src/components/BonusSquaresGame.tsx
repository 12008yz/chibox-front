import { useState, useEffect } from 'react';
import { useGetBonusStatusQuery, usePlayBonusSquaresMutation, useResetBonusCooldownMutation } from '../features/user/userApi';
import Modal from './Modal';

interface BonusSquaresGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const BonusSquaresGame: React.FC<BonusSquaresGameProps> = ({ isOpen, onClose }) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [revealedSquares, setRevealedSquares] = useState<boolean[]>(new Array(9).fill(false));
  const [gameResult, setGameResult] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [allPrizes, setAllPrizes] = useState<(string | null)[]>([]);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [gamePlayedInThisSession, setGamePlayedInThisSession] = useState(false);

  const { data: bonusStatus, refetch: refetchBonusStatus, isFetching } = useGetBonusStatusQuery(undefined, {
    // Отключаем кэширование для отладки
    refetchOnMountOrArgChange: true,
  });
  const [playBonusSquares, { isLoading: isPlaying }] = usePlayBonusSquaresMutation();
  const [resetBonusCooldown, { isLoading: isResetting }] = useResetBonusCooldownMutation();

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setSelectedSquare(null);
      setGameStarted(false);
      setGameEnded(false);
      setRevealedSquares(new Array(9).fill(false));
      setGameResult('');
      setIsAnimating(false);
      setShowParticles(false);
      setHoveredSquare(null);
      setAllPrizes([]);
      setWonPrize(null);
      setGamePlayedInThisSession(false);
      refetchBonusStatus();
    }
  }, [isOpen, refetchBonusStatus]);

  const playClickSound = () => {
    // Можно добавить реальные звуки позже
    console.log('🔊 Click sound');
  };

  const playWinSound = () => {
    console.log('🔊 Win sound');
  };

  const handleSquareClick = (index: number) => {
    if (gameEnded || isPlaying || revealedSquares[index] || isAnimating) return;

    playClickSound();
    setSelectedSquare(index);
    setGameStarted(true);
    setIsAnimating(true);

    // Анимация выбора
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleResetCooldown = async () => {
    console.log('🔄 Начинаем сброс кулдауна...');
    try {
      const result = await resetBonusCooldown().unwrap();
      console.log('✅ Кулдаун сброшен успешно:', result);
      await refetchBonusStatus();
      console.log('🔍 Статус обновлен');
      alert('✅ Кулдаун успешно сброшен!');
    } catch (error: any) {
      console.error('❌ Ошибка при сбросе кулдауна:', error);
      console.error('❌ Детали ошибки:', {
        status: error?.status,
        data: error?.data,
        message: error?.message
      });
      alert(`Ошибка сброса кулдауна: ${error?.data?.message || error?.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleRefreshStatus = async () => {
    console.log('🔍 Обновляем статус бонуса...');
    try {
      await refetchBonusStatus();
      console.log('✅ Статус обновлен');
    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
    }
  };

  const handlePlayGame = async () => {
    if (selectedSquare === null) return;

    setIsAnimating(true);
    setGamePlayedInThisSession(true);

    try {
      const result = await playBonusSquares({
        chosenCell: selectedSquare
      }).unwrap();

      // Сразу показываем все результаты без задержек
      setGameResult(result.message || 'Игра завершена!');
      setAllPrizes(result.all_prizes || []);
      setWonPrize(result.won_prize || null);

      // Сразу открываем ВСЕ кубики
      setRevealedSquares(new Array(9).fill(true));
      setGameEnded(true);
      setIsAnimating(false);

      // Проверяем, выиграл ли игрок
      if (result.message && !result.message.includes('ничего не выиграли')) {
        playWinSound();
        setShowParticles(true);

        // Убираем частицы через 3 секунды
        setTimeout(() => setShowParticles(false), 3000);
      }

      // Обновляем статус в фоне, но не мешаем показу результатов
      refetchBonusStatus();

    } catch (error: any) {
      console.error('❌ Ошибка при игре в бонусные квадраты:', error);
      console.error('❌ Детали ошибки:', {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        error: error?.error
      });

      // Показываем более информативное сообщение об ошибке
      const errorMessage = error?.data?.message || error?.message || 'Произошла ошибка при игре. Попробуйте позже.';
      setGameResult(`Ошибка: ${errorMessage}`);
      setGameEnded(true);
      setIsAnimating(false);
    }
  };

  const isAvailable = bonusStatus?.is_available;
  const timeUntilNext = bonusStatus?.time_until_next_seconds;

  // Добавим отладочную информацию в консоль
  console.log('🎲 BonusSquaresGame - текущий статус:', {
    isAvailable,
    timeUntilNext,
    gameStarted,
    gameEnded,
    gamePlayedInThisSession,
    allPrizes: allPrizes.length,
    bonusStatus: bonusStatus,
    isOpen
  });

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSquareIcon = (index: number) => {
    if (revealedSquares[index]) {
      // Если игра закончена и у нас есть информация о всех призах
      if (gameEnded && allPrizes.length > 0) {
        const prize = allPrizes[index];
        switch (prize) {
          case 'item':
            return '🎁';
          case 'sub_days':
            return '⭐';
          case null:
            return '💸'; // Пустая клетка
          default:
            return '❓';
        }
      }
      // Если показываем только выбранную клетку
      if (index === selectedSquare) {
        return wonPrize === 'item' ? '🎁' :
               wonPrize === 'sub_days' ? '⭐' :
               wonPrize === null ? '💸' : '❓';
      }
    }
    return '❓';
  };

  const getSquareClass = (index: number) => {
    const baseClass = `
      aspect-square flex items-center justify-center rounded-xl border-2 transition-all duration-300 relative overflow-hidden
      ${gameEnded || isPlaying || isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}
    `;

    if (revealedSquares[index]) {
      // Если игра закончена и это выбранная клетка
      if (index === selectedSquare) {
        const prize = gameEnded && allPrizes.length > 0 ? allPrizes[index] : wonPrize;
        if (prize === 'item' || prize === 'sub_days') {
          return `${baseClass} border-yellow-400 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 scale-105 shadow-lg shadow-yellow-500/25 animate-pulse`;
        } else {
          return `${baseClass} border-red-400 bg-gradient-to-br from-red-500/30 to-red-600/30 scale-105`;
        }
      }

      // Если игра закончена и это не выбранная клетка
      if (gameEnded && allPrizes.length > 0) {
        const prize = allPrizes[index];
        if (prize === 'item' || prize === 'sub_days') {
          return `${baseClass} border-green-400 bg-gradient-to-br from-green-500/20 to-emerald-600/20`;
        } else {
          return `${baseClass} border-gray-500 bg-gradient-to-br from-gray-600/20 to-gray-700/20`;
        }
      }

      return `${baseClass} border-green-400 bg-gradient-to-br from-green-500/30 to-emerald-600/30`;
    }

    if (selectedSquare === index) {
      return `${baseClass} border-yellow-400 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 scale-105 shadow-lg shadow-yellow-500/25`;
    }

    if (hoveredSquare === index && !gameEnded && !isPlaying && !isAnimating) {
      return `${baseClass} border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-102 shadow-md`;
    }

    return `${baseClass} border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-500 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 rounded-2xl relative overflow-hidden">
        {/* Фоновые частицы */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Заголовок */}
        <div className="text-center mb-6 relative z-10">
          <div className="text-5xl mb-3 animate-bounce">🎲</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Кубики Удачи
          </h2>
          <p className="text-gray-400 text-sm">
            Выберите один из 9 кубиков и получите награду!
          </p>
        </div>

        {!isAvailable && !gameStarted && !gamePlayedInThisSession ? (
          // Бонус недоступен
          <div className="text-center relative z-10">
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 mb-4 backdrop-blur-sm">
              <div className="text-red-400 mb-3 text-xl">⏰</div>
              <div className="text-red-400 mb-2 font-medium">Бонус пока недоступен</div>
              {timeUntilNext && (
                <div className="text-gray-300 text-sm">
                  Следующий бонус через: <span className="font-mono text-yellow-400">{formatTimeLeft(timeUntilNext)}</span>
                </div>
              )}
              {bonusStatus?.debug_info && (
                <details className="mt-3 text-xs">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-400">Отладочная информация</summary>
                  <div className="mt-2 text-gray-400 font-mono text-xs bg-gray-800/50 p-2 rounded">
                    <div>Текущее время: {bonusStatus.debug_info.current_time}</div>
                    <div>Время следующего бонуса: {bonusStatus.debug_info.next_bonus_time || 'не установлено'}</div>
                    <div>Проверка времени пройдена: {bonusStatus.debug_info.is_time_check_passed ? 'да' : 'нет'}</div>
                  </div>
                </details>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ Кнопка сброса кулдауна нажата');
                    handleResetCooldown();
                  }}
                  disabled={isResetting}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  type="button"
                >
                  {isResetting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Сброс...
                    </span>
                  ) : (
                    '🔄 Сбросить кулдаун'
                  )}
                </button>
                <button
                  onClick={handleRefreshStatus}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                  type="button"
                >
                  🔍 Обновить статус
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          // Игра доступна ИЛИ уже началась/закончилась
          <div className="relative z-10">
            {/* Сетка кубиков */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleSquareClick(index)}
                  onMouseEnter={() => setHoveredSquare(index)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  disabled={gameEnded || isPlaying || isAnimating}
                  className={getSquareClass(index)}
                >
                  {/* Фоновый эффект */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

                  {/* Иконка */}
                  <span className="text-3xl relative z-10 transition-transform duration-300">
                    {getSquareIcon(index)}
                  </span>

                  {/* Эффект свечения для выбранного кубика */}
                  {selectedSquare === index && !gameEnded && (
                    <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-xl" />
                  )}
                </button>
              ))}
            </div>

            {/* Статус игры */}
            <div className="text-center mb-6 min-h-[80px] flex items-center justify-center">
              {!gameStarted && (
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-blue-400 text-sm flex items-center justify-center gap-2">
                    <span className="animate-pulse">✨</span>
                    Выберите кубик, чтобы начать игру
                    <span className="animate-pulse">✨</span>
                  </p>
                </div>
              )}

              {gameStarted && !gameEnded && selectedSquare !== null && (
                <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-purple-400 text-sm mb-2 flex items-center justify-center gap-2">
                    <span className="animate-spin">🎲</span>
                    Выбран кубик #{selectedSquare + 1}
                  </p>
                  <p className="text-gray-300 text-xs">
                    Нажмите "Играть", чтобы узнать свою награду!
                  </p>
                </div>
              )}

              {gameResult && (
                <div className="space-y-3">
                  <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-green-400 font-medium flex items-center justify-center gap-2">
                      {gameResult.includes('ничего не выиграли') ? (
                        <>😔 {gameResult}</>
                      ) : (
                        <>🎉 {gameResult}</>
                      )}
                    </p>
                  </div>

                  {gameEnded && allPrizes.length > 0 && (
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-blue-400 text-sm text-center mb-2">
                        ✨ Все клетки открыты! Посмотрите, что могло быть:
                      </p>
                      <div className="text-xs text-gray-300 text-center">
                        🎁 Предметы: {allPrizes.filter(p => p === 'item').length} шт. •
                        ⭐ Подписки: {allPrizes.filter(p => p === 'sub_days').length} шт. •
                        💸 Пустые: {allPrizes.filter(p => p === null).length} шт.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAnimating && (
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full" />
                  <span>Обработка...</span>
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              {gameStarted && !gameEnded && (
                <button
                  onClick={handlePlayGame}
                  disabled={isPlaying || selectedSquare === null || isAnimating}
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                >
                  {isPlaying || isAnimating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Играем...
                    </span>
                  ) : (
                    '🎲 Играть!'
                  )}
                </button>
              )}

              {gameEnded && (
                <button
                  onClick={async () => {
                    await refetchBonusStatus();
                    onClose();
                  }}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
                >
                  🔍 Обновить и закрыть
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105"
              >
                {gameEnded ? '❌ Просто закрыть' : '❌ Отмена'}
              </button>
            </div>

            {/* Информация о наградах */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center space-y-2">
                <p className="text-yellow-400 font-medium">🎁 Возможные награды:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span>📦</span>
                    <span>Бонусный кейс</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🎁</span>
                    <span>Случайный предмет</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>3 дня подписки</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💎</span>
                    <span>Опыт за участие</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BonusSquaresGame;
