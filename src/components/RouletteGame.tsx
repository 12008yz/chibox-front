import { useState, useEffect, useRef } from 'react';
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
  const [rotationAngle, setRotationAngle] = useState(0);
  const wheelRef = useRef<SVGGElement>(null);

  const { data: bonusStatus, refetch: refetchBonusStatus } = useGetBonusStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [playRoulette, { isLoading: isPlaying }] = usePlayRouletteMutation();

  // Определяем элементы рулетки - 9 секторов, только 2 с подарками
  const rouletteItems: RouletteItem[] = [
    { id: 0, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
    { id: 1, type: 'sub_1_day', label: '+1 День', color: '#FBBF24', bgColor: '#F59E0B', icon: '⭐' },
    { id: 2, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
    { id: 3, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
    { id: 4, type: 'sub_3_days', label: '+3 Дня', color: '#34D399', bgColor: '#10B981', icon: '💎' },
    { id: 5, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
    { id: 6, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
    { id: 7, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
    { id: 8, type: 'empty', label: 'Пусто', color: '#9CA3AF', bgColor: '#4B5563', icon: '💫' },
  ];

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setGameState('idle');
      setIsSpinning(false);
      setWinnerIndex(null);
      setGameResult('');
      setShowParticles(false);
      setRotationAngle(0);
      refetchBonusStatus();
    }
  }, [isOpen, refetchBonusStatus]);

  const handleSpin = async () => {
    if (isSpinning || gameState !== 'idle' || isPlaying) return;

    setIsSpinning(true);
    setGameState('spinning');
    setWinnerIndex(null);

    try {
      // Делаем запрос к API
      const response = await playRoulette().unwrap();

      // Используем точный угол от сервера
      const finalAngle = response.rotation_angle;

      console.log('🎰 Server response:', {
        winnerIndex: response.winner_index,
        rotationAngle: finalAngle.toFixed(1),
        prizeType: response.prize_type
      });

      // Отладка: проверяем правильность попадания указателя
      const sectorAngle = 360 / rouletteItems.length;
      const normalizedAngle = ((finalAngle % 360) + 360) % 360;
      const winnerSectorCenter = response.winner_index * sectorAngle; // Центр сектора N на N*40°
      const sectorCenterAfterRotation = (winnerSectorCenter + normalizedAngle) % 360;

      // Проверяем, где должна быть стрелочка после поворота
      const expectedPointerTarget = (360 - normalizedAngle) % 360;
      const actualWinnerItem = rouletteItems[response.winner_index];

      // Проверяем правильность: куда указывает стрелочка после поворота
      const distanceFromPointer = Math.min(
        Math.abs(sectorCenterAfterRotation),
        Math.abs(sectorCenterAfterRotation - 360)
      );
      const isCorrectAlignment = distanceFromPointer <= sectorAngle / 2;

      console.log('🎯 Проверка точности рулетки:', {
        winnerSector: response.winner_index,
        sectorAngle: sectorAngle.toFixed(1) + '°',
        wheelRotation: normalizedAngle.toFixed(1) + '°',
        sectorFinalPosition: sectorCenterAfterRotation.toFixed(1) + '°',
        pointerPosition: '0° (верх)',
        distanceFromPointer: distanceFromPointer.toFixed(1) + '°',
        isAlignedCorrectly: isCorrectAlignment,
        expectedPrize: actualWinnerItem.type,
        actualResult: response.prize_type,
        resultsMatch: actualWinnerItem.type === response.prize_type,
        message: response.message
      });

      await animateRouletteToAngle(finalAngle);

      // 🎯 КРИТИЧЕСКАЯ ПРОВЕРКА: проверяем, куда РЕАЛЬНО указывает стрелочка
      const actualSectorIndex = calculateSectorUnderPointer(finalAngle);
      const serverSaidIndex = response.winner_index;

      console.log('🔍 ПРОВЕРКА ТОЧНОСТИ РУЛЕТКИ:', {
        serverSaidWinner: serverSaidIndex,
        actualPointerAt: actualSectorIndex,
        isAccurate: serverSaidIndex === actualSectorIndex,
        serverItem: rouletteItems[serverSaidIndex],
        actualItem: rouletteItems[actualSectorIndex],
        finalAngle: finalAngle.toFixed(1)
      });

      // Используем РЕАЛЬНЫЙ результат, а не серверный (для честности)
      const realWinnerIndex = actualSectorIndex;
      const realWinnerItem = rouletteItems[realWinnerIndex];

      setWinnerIndex(realWinnerIndex);
      setGameState('finished');

      // Обновляем результат на основе реального попадания
      if (realWinnerItem.type !== 'empty') {
        setGameResult(`Поздравляем! Вы выиграли ${realWinnerItem.label}!`);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      } else {
        setGameResult('В этот раз не повезло. Попробуйте еще раз!');
      }

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

  const animateRouletteToAngle = (targetAngle: number): Promise<void> => {
    return new Promise((resolve) => {
      console.log('🎰 Animating wheel to angle:', targetAngle);
      setRotationAngle(targetAngle);

      // Анимация длится 4 секунды - синхронизировано с CSS transition
      setTimeout(resolve, 4000);
    });
  };

  // 🎯 Определяем, на какой сектор указывает стрелочка после поворота
  const calculateSectorUnderPointer = (rotationAngle: number): number => {
    const sectorAngle = 360 / rouletteItems.length; // 40°

    // Нормализуем угол поворота в диапазон [0, 360)
    const normalizedRotation = ((rotationAngle % 360) + 360) % 360;

    // Стрелочка указывает на 0° (вверх)
    // После поворота колеса на normalizedRotation,
    // сектор который был на угле X теперь находится на угле (X + normalizedRotation) % 360

    // Сектор 0 изначально на 0°, после поворота он на normalizedRotation
    // Сектор 1 изначально на 40°, после поворота он на (40 + normalizedRotation) % 360
    // И т.д.

    // Нам нужно найти сектор, который после поворота оказался на 0° (под стрелочкой)
    // Это сектор, который изначально был на угле (-normalizedRotation) % 360
    const originalAngleUnderPointer = (360 - normalizedRotation) % 360;

    // Определяем индекс сектора по углу
    let sectorIndex = Math.floor(originalAngleUnderPointer / sectorAngle);

    // Убеждаемся что индекс в правильном диапазоне
    sectorIndex = Math.max(0, Math.min(sectorIndex, rouletteItems.length - 1));

    console.log('🔍 Расчет сектора под стрелочкой:', {
      rotationAngle: rotationAngle.toFixed(1),
      normalizedRotation: normalizedRotation.toFixed(1),
      originalAngleUnderPointer: originalAngleUnderPointer.toFixed(1),
      sectorAngle: sectorAngle.toFixed(1),
      calculatedSectorIndex: sectorIndex
    });

    return sectorIndex;
  };

  // Создание сектора SVG
  const createSector = (item: RouletteItem, index: number) => {
    const radius = 140;
    const centerX = 150;
    const centerY = 150;
    const sectorAngle = 360 / rouletteItems.length; // 40 градусов на сектор

    // Позиционируем секторы так, чтобы сектор 0 был центрирован сверху
    // Сдвигаем на -sectorAngle/2, чтобы центр сектора 0 был на 0°
    const startAngle = index * sectorAngle - sectorAngle/2;
    const endAngle = (index + 1) * sectorAngle - sectorAngle/2;

    // Конвертируем углы в радианы
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Рассчитываем координаты пути
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sectorAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Позиция для текста (в центре сектора)
    const textAngle = startAngle + sectorAngle / 2;
    const textRad = (textAngle * Math.PI) / 180;
    const textRadius = radius * 0.7;
    const textX = centerX + textRadius * Math.cos(textRad);
    const textY = centerY + textRadius * Math.sin(textRad);

    // Определяем, является ли сектор выигрышным
    const isWinner = winnerIndex === index && gameState === 'finished';

    return (
      <g key={item.id}>
        <path
          d={pathData}
          fill={item.bgColor}
          stroke={isWinner ? '#FFD700' : '#1F2937'}
          strokeWidth={isWinner ? '4' : '2'}
          className={`transition-all duration-300 ${isWinner ? 'drop-shadow-2xl' : ''}`}
          style={{
            filter: isWinner ? 'brightness(1.3) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'none'
          }}
        />
        <text
          x={textX}
          y={textY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={item.color}
          fontSize="18"
          className="font-bold pointer-events-none"
        >
          {item.icon}
        </text>
        <text
          x={textX}
          y={textY + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={item.color}
          fontSize="9"
          className="font-medium pointer-events-none"
        >
          {item.label}
        </text>
      </g>
    );
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
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8 rounded-2xl w-full max-w-lg mx-auto">
        {/* Particles Effect */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-ping"
                style={{
                  backgroundColor: ['#FBBF24', '#34D399', '#F59E0B', '#10B981'][Math.floor(Math.random() * 4)],
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
        <div className="text-center mb-6">
          <div className="text-3xl sm:text-4xl mb-2">🎰</div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Рулетка Удачи
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Крутите рулетку и выигрывайте дни подписки!
          </p>
        </div>

        {!isAvailable && gameState === 'idle' ? (
          // Бонус недоступен
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl mb-3">⏰</div>
              <div className="text-red-400 mb-2 font-medium text-sm sm:text-base">Рулетка недоступна</div>
              {timeUntilNext && (
                <div className="text-gray-300 text-xs sm:text-sm">
                  Следующая игра через: <span className="font-mono text-yellow-400">{formatTimeLeft(timeUntilNext)}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 text-sm sm:text-base"
            >
              Закрыть
            </button>
          </div>
        ) : (
          // Игра доступна
          <div className="space-y-4 sm:space-y-6">
            {/* Рулетка */}
            <div className="flex justify-center">
              <div className="relative">
                {/* SVG Рулетка */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                  <svg width="100%" height="100%" viewBox="0 0 300 300" className="drop-shadow-2xl">
                    {/* Внешнее кольцо */}
                    <circle
                      cx="150"
                      cy="150"
                      r="145"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="6"
                      className="drop-shadow-lg"
                    />

                    {/* Колесо рулетки */}
                    <g
                      ref={wheelRef}
                      style={{
                        transformOrigin: '150px 150px',
                        transform: `rotate(${rotationAngle}deg)`,
                        transition: isSpinning ? 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                      }}
                    >
                      {rouletteItems.map((item, index) => createSector(item, index))}
                    </g>

                    {/* Центральный круг */}
                    <circle
                      cx="150"
                      cy="150"
                      r="25"
                      fill="#1F2937"
                      stroke="#D97706"
                      strokeWidth="3"
                    />

                    {/* Центральная звезда */}
                    <text
                      x="150"
                      y="155"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FBBF24"
                      fontSize="20"
                      className="pointer-events-none"
                    >
                      ⭐
                    </text>
                  </svg>

                  {/* Стрелочка указатель - сверху (0°) */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
                    <div
                      className="w-0 h-0 border-l-[12px] sm:border-l-[15px] border-r-[12px] sm:border-r-[15px] border-b-[20px] sm:border-b-[25px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Статус игры */}
            <div className="text-center min-h-[60px] sm:min-h-[80px] flex flex-col items-center justify-center">
              {gameState === 'idle' && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm sm:text-base">Нажмите "Крутить" чтобы начать!</p>
                  <div className="text-xs text-gray-500">
                    <p>Шансы: 20% - 1 день, 10% - 3 дня, 70% - пусто</p>
                  </div>
                </div>
              )}

              {gameState === 'spinning' && (
                <div className="flex flex-col items-center gap-3 text-yellow-400">
                  <div className="animate-pulse text-2xl sm:text-3xl">🎰</div>
                  <span className="font-medium text-sm sm:text-base">Рулетка крутится...</span>
                </div>
              )}

              {gameState === 'finished' && gameResult && (
                <div className="space-y-3">
                  <div className="text-3xl sm:text-4xl">
                    {winnerIndex !== null && rouletteItems[winnerIndex].type !== 'empty' ? '🎉' : '😔'}
                  </div>
                  <p className={`font-medium text-sm sm:text-lg ${
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
                  className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  🎰 Крутить рулетку!
                </button>
              )}

              <button
                onClick={onClose}
                className={`py-3 sm:py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                  gameState === 'idle' ? 'px-6 sm:px-8' : 'flex-1'
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
                  <div className="flex justify-center gap-4 sm:gap-6 text-gray-400">
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                      <span className="text-yellow-400">⭐</span>
                      +1 День
                    </span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
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
