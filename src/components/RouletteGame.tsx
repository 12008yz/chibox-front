import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePlayRouletteMutation } from '../features/user/userApi';
import toast from 'react-hot-toast';

// Конфигурация 9 секций рулетки
const ROULETTE_SEGMENTS = [
  { id: 0, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' },
  { id: 1, type: 'sub_1_day', value: 1, color: '#059669', textColor: '#FFFFFF' },
  { id: 2, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' },
  { id: 3, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' },
  { id: 4, type: 'sub_2_days', value: 2, color: '#DC2626', textColor: '#FFFFFF' },
  { id: 5, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' },
  { id: 6, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' },
  { id: 7, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' },
  { id: 8, type: 'empty', value: 0, color: '#6B7280', textColor: '#FFFFFF' }
];

// Функция для получения случайной фразы
const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

// Компонент колеса рулетки
const RouletteWheel: React.FC<{
  isSpinning: boolean;
  rotationAngle: number;
  t: any;
}> = ({ isSpinning, rotationAngle, t }) => {
  const segmentAngle = 360 / 9; // 40 градусов на секцию
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  // Создаем путь для каждой секции
  const createSegmentPath = (index: number) => {
    const startAngle = (index * segmentAngle - segmentAngle / 2) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - segmentAngle / 2) * (Math.PI / 180);

    // Логируем углы секций для отладки
    if (index === 0) {
      console.log('🎯 Углы секций:', ROULETTE_SEGMENTS.map((seg, idx) => ({
        id: seg.id,
        type: seg.type,
        startDegrees: idx * segmentAngle - segmentAngle / 2,
        endDegrees: (idx + 1) * segmentAngle - segmentAngle / 2,
        centerDegrees: idx * segmentAngle
      })));
    }

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Позиция текста для каждой секции
  const getTextPosition = (index: number) => {
    const angle = (index * segmentAngle) * (Math.PI / 180);
    const textRadius = radius * 0.75;
    const x = centerX + textRadius * Math.cos(angle);
    const y = centerY + textRadius * Math.sin(angle) + 5; // +5 для центрирования по вертикали
    return { x, y, angle: angle * (180 / Math.PI) };
  };

  // Получаем текст для секции
  const getSegmentText = (segment: typeof ROULETTE_SEGMENTS[0]) => {
    if (segment.type === 'sub_1_day') return `1 ${t('time.day')}`;
    if (segment.type === 'sub_2_days') return `2 ${t('time.days')}`;
    return t('roulette.empty');
  };

  return (
    <div className="relative">
      <svg
        width="300"
        height="300"
        className="drop-shadow-lg"
      >
        {/* Внешний круг/рамка */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 5}
          fill="none"
          stroke="#374151"
          strokeWidth="10"
        />

        {/* Колесо с анимацией */}
        <g
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
            transform: `rotate(${rotationAngle}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
          }}
        >
          {ROULETTE_SEGMENTS.map((segment, index) => {
            const textPos = getTextPosition(index);
            return (
              <g key={segment.id}>
                {/* Секция */}
                <path
                  d={createSegmentPath(index)}
                  fill={segment.color}
                  stroke="#1F2937"
                  strokeWidth="2"
                />

                {/* Текст секции */}
                <text
                  x={textPos.x}
                  y={textPos.y}
                  fill={segment.textColor}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textPos.angle + 90}, ${textPos.x}, ${textPos.y})`}
                >
                  {getSegmentText(segment)}
                </text>

                {/* Номер секции для отладки */}
                <text
                  x={textPos.x}
                  y={textPos.y - 15}
                  fill="#FFFF00"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textPos.angle + 90}, ${textPos.x}, ${textPos.y - 15})`}
                >
                  #{index}
                </text>
              </g>
            );
          })}
        </g>

        {/* Центральный круг */}
        <circle
          cx={centerX}
          cy={centerY}
          r="15"
          fill="#1F2937"
          stroke="#374151"
          strokeWidth="2"
        />
      </svg>

      {/* Указатель/стрелка */}
      <div
        className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10"
        style={{ marginLeft: '-1px' }}
      >
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '20px solid #EF4444',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />
      </div>
    </div>
  );
};

interface RouletteGameProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ isOpen, onClose, className = '' }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [nextPlayTime, setNextPlayTime] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [playRoulette, { isLoading, error }] = usePlayRouletteMutation();

  // Получаем локализованные сообщения
  const loseMessages = t('roulette.lose_messages', { returnObjects: true }) as string[];
  const winMessages = t('roulette.win_messages', { returnObjects: true }) as string[];

  // Проверяем, можно ли играть
  const canPlay = !isSpinning && !isLoading && !nextPlayTime;

  useEffect(() => {
    // Проверяем, есть ли сохраненное время следующей игры
    const savedNextPlayTime = localStorage.getItem('roulette_next_play_time');
    if (savedNextPlayTime) {
      const nextTime = new Date(savedNextPlayTime);
      if (nextTime > new Date()) {
        setNextPlayTime(savedNextPlayTime);
      } else {
        localStorage.removeItem('roulette_next_play_time');
      }
    }

    // Загружаем сохраненный угол поворота
    const savedRotation = localStorage.getItem('roulette_last_rotation');
    if (savedRotation) {
      setRotationAngle(parseInt(savedRotation, 10));
    }

    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const spin = async () => {
    if (!canPlay) return;

    try {
      setIsSpinning(true);
      const response = await playRoulette().unwrap();

      if (response.success) {
        console.log('🎲 Рулетка - ответ сервера:', response);

        // Получаем угол поворота от сервера
        const targetRotation = rotationAngle + response.rotation_angle;

        console.log('🎲 Рулетка - углы:', {
          currentRotation: rotationAngle,
          serverRotation: response.rotation_angle,
          targetRotation: targetRotation,
          winnerIndex: response.winner_index,
          prizeType: response.prize_type
        });

        setRotationAngle(targetRotation);
        setLastResult(response);

        // Сохраняем время следующей игры
        setNextPlayTime(response.next_time);
        localStorage.setItem('roulette_next_play_time', response.next_time);

        // Сохраняем финальный угол поворота
        localStorage.setItem('roulette_last_rotation', targetRotation.toString());

        // Устанавливаем таймер для завершения анимации
        spinTimeoutRef.current = setTimeout(() => {
          handleSpinComplete(response);
        }, 3000); // 3 секунды - время анимации

      } else {
        setIsSpinning(false);
        toast.error(response.message || t('roulette.something_went_wrong'));
        if (response.next_time) {
          setNextPlayTime(response.next_time);
          localStorage.setItem('roulette_next_play_time', response.next_time);
        }
      }
    } catch (err: any) {
      setIsSpinning(false);
      console.error(t('roulette.roulette_error'), err);
      toast.error(err.data?.message || t('roulette.error_occurred'));
    }
  };

  // Функция для определения выигрышной секции по углу поворота
  const getWinnerSegmentByAngle = (finalAngle: number): number => {
    // Нормализуем угол к диапазону 0-360
    const normalizedAngle = ((finalAngle % 360) + 360) % 360;

    // Указатель находится сверху (0 градусов), нужно определить на какую секцию он указывает
    // Каждая секция занимает 40 градусов (360 / 9)
    const segmentAngle = 360 / 9;

    // Указатель находится сверху (0 градусов)
    // После поворота колеса на normalizedAngle градусов,
    // позиция указателя относительно колеса
    const pointerPosition = (360 - normalizedAngle) % 360;

    // Определяем индекс секции
    const segmentIndex = Math.floor(pointerPosition / segmentAngle) % 9;

    // Детальное логирование для отладки
    console.log('🎯 Подробное определение выигрышной секции:', {
      finalAngle,
      normalizedAngle,
      pointerPosition,
      segmentAngle,
      segmentIndex,
      segmentInfo: ROULETTE_SEGMENTS[segmentIndex],
      allSegments: ROULETTE_SEGMENTS.map((seg, idx) => ({
        index: idx,
        type: seg.type,
        startAngle: idx * segmentAngle - segmentAngle / 2,
        endAngle: (idx + 1) * segmentAngle - segmentAngle / 2,
        centerAngle: idx * segmentAngle,
        isWinner: idx === segmentIndex
      }))
    });

    return segmentIndex;
  };

  // Обработка завершения вращения
  const handleSpinComplete = (result: any) => {
    setIsSpinning(false);

    // Определяем реальную выигрышную секцию по финальному углу
    const realWinnerIndex = getWinnerSegmentByAngle(rotationAngle);
    const realWinnerSegment = ROULETTE_SEGMENTS[realWinnerIndex];

    // Сравниваем с тем, что прислал сервер
    const serverWinnerSegment = ROULETTE_SEGMENTS[result.winner_index];

    console.log('🔍 Сравнение результатов:', {
      server: {
        index: result.winner_index,
        type: serverWinnerSegment.type,
        value: serverWinnerSegment.value
      },
      real: {
        index: realWinnerIndex,
        type: realWinnerSegment.type,
        value: realWinnerSegment.value
      },
      match: realWinnerIndex === result.winner_index
    });

    // Используем реальную выигрышную секцию для отображения
    const winnerSegment = realWinnerSegment;

    // Показываем результат
    if (winnerSegment.type === 'empty') {
      const randomLoseMessage = getRandomMessage(loseMessages);
      toast(randomLoseMessage, {
        icon: '😔',
        style: {
          background: '#374151',
          color: '#fff',
          border: '1px solid #6b7280',
          zIndex: 999999999,
        },
      });
    } else {
      const randomWinMessage = getRandomMessage(winMessages);
      toast(randomWinMessage, {
        icon: '🎉',
        style: {
          background: '#059669',
          color: '#fff',
          border: '1px solid #10b981',
          zIndex: 999999999,
        },
      });
    }

    // Если есть несоответствие, логируем ошибку
    if (realWinnerIndex !== result.winner_index) {
      console.error('❌ ОШИБКА: Несоответствие между сервером и фронтендом!', {
        serverIndex: result.winner_index,
        realIndex: realWinnerIndex,
        finalAngle: rotationAngle
      });
    }
  };

  const formatTimeRemaining = (nextTime: string) => {
    const now = new Date();
    const next = new Date(nextTime);
    const diff = next.getTime() - now.getTime();

    if (diff <= 0) {
      setNextPlayTime(null);
      localStorage.removeItem('roulette_next_play_time');
      return '';
    }

    const totalMinutes = Math.ceil(diff / (1000 * 60));

    if (totalMinutes < 60) {
      return `${totalMinutes}м`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}ч ${minutes}м`;
    }
  };

  // Предотвращаем скроллинг страницы когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Очистка при размонтировании или закрытии
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 my-auto max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {t('roulette.wheel_of_fortune')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 flex flex-col items-center space-y-4 ${className}`}>
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-1">{t('roulette.spin_and_win')}</p>
            <p className="text-xs text-gray-400">{t('roulette.games_per_day')}</p>
          </div>

          {/* Колесо рулетки - собственная реализация */}
          <div className="relative flex justify-center">
            <RouletteWheel
              isSpinning={isSpinning}
              rotationAngle={rotationAngle}
              t={t}
            />
          </div>

          {/* Кнопка тестирования (временная) */}
          <div className="text-center mb-4">
            <button
              onClick={() => {
                console.log('🧪 ТЕСТ: Проверка соответствия углов и секций');
                for (let i = 0; i < 9; i++) {
                  const testAngle = i * 40 + 20; // центр каждой секции
                  const detectedIndex = getWinnerSegmentByAngle(testAngle);
                  console.log(`Секция ${i} (центр ${testAngle}°) → детектируется как секция ${detectedIndex}`);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
            >
              🧪 Тест углов
            </button>
          </div>

          {/* Кнопка для вращения */}
          <div className="text-center">
            {nextPlayTime ? (
              <div className="space-y-2">
                <p className="text-gray-300">{t('roulette.next_game_in')}</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatTimeRemaining(nextPlayTime)}
                </p>
              </div>
            ) : (
              <button
                onClick={spin}
                disabled={!canPlay}
                className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors ${
                  canPlay
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSpinning ? t('roulette.spinning') : isLoading ? t('common.loading') : t('roulette.spin_wheel')}
              </button>
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="text-center p-4 bg-red-900 rounded-lg border border-red-600">
              <p className="text-red-200">
                {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
                  ? (error.data as any).message
                  : t('roulette.error_occurred')}
              </p>
            </div>
          )}

          {/* Легенда */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">{t('roulette.prizes')}</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                <span className="text-gray-300 font-semibold">{t('roulette.subscription_1_day')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                <span className="text-gray-300 font-semibold">{t('roulette.subscription_2_days')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span className="text-gray-400">{t('roulette.empty')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Рендерим модальное окно в body через портал
  return createPortal(modalContent, document.body);
};

export default RouletteGame;
