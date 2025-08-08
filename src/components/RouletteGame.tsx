import React, { useState, useRef, useEffect } from 'react';
import { usePlayRouletteMutation } from '../features/user/userApi';

interface RouletteSegment {
  id: number;
  type: 'empty' | 'sub_1_day' | 'sub_2_days';
  label: string;
  color: string;
  textColor: string;
}

// Конфигурация 9 секций рулетки
const ROULETTE_SEGMENTS: RouletteSegment[] = [
  { id: 0, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' },
  { id: 1, type: 'sub_1_day', label: '1 день', color: '#059669', textColor: '#FFFFFF' },
  { id: 2, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' },
  { id: 3, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' },
  { id: 4, type: 'sub_2_days', label: '2 дня', color: '#DC2626', textColor: '#FFFFFF' },
  { id: 5, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' },
  { id: 6, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' },
  { id: 7, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' },
  { id: 8, type: 'empty', label: 'Пусто', color: '#4B5563', textColor: '#D1D5DB' }
];

interface RouletteGameProps {
  className?: string;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ className = '' }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [nextPlayTime, setNextPlayTime] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const [playRoulette, { isLoading, error }] = usePlayRouletteMutation();

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
  }, []);

  const spin = async () => {
    if (!canPlay) return;

    setIsSpinning(true);
    setResult(null);

    try {
      const response = await playRoulette().unwrap();

      if (response.success) {
        // Анимируем вращение колеса
        const targetRotation = response.rotation_angle;
        setCurrentRotation(targetRotation);

        // Сохраняем время следующей игры
        setNextPlayTime(response.next_time);
        localStorage.setItem('roulette_next_play_time', response.next_time);

        // Показываем результат после анимации
        setTimeout(() => {
          setResult(response.message);
          setIsSpinning(false);
        }, 4000); // 4 секунды анимации
      } else {
        setResult(response.message);
        if (response.next_time) {
          setNextPlayTime(response.next_time);
          localStorage.setItem('roulette_next_play_time', response.next_time);
        }
        setIsSpinning(false);
      }
    } catch (err: any) {
      console.error('Ошибка при игре в рулетку:', err);
      setResult(err.data?.message || 'Произошла ошибка');
      setIsSpinning(false);
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

  // Создаем SVG элементы для секций колеса
  const createWheelSegments = () => {
    const segments = [];
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    const segmentAngle = 360 / 9;

    for (let i = 0; i < 9; i++) {
      const startAngle = i * segmentAngle - 90; // -90 чтобы первая секция была вверху
      const endAngle = (i + 1) * segmentAngle - 90;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = segmentAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Позиция текста
      const textAngle = startAngle + segmentAngle / 2;
      const textAngleRad = (textAngle * Math.PI) / 180;
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.cos(textAngleRad);
      const textY = centerY + textRadius * Math.sin(textAngleRad);

      const segment = ROULETTE_SEGMENTS[i];

      segments.push(
        <g key={i}>
          <path
            d={pathData}
            fill={segment.color}
            stroke="#FFFFFF"
            strokeWidth={segment.type !== 'empty' ? "3" : "2"}
            filter={segment.type !== 'empty' ? "url(#glow)" : ""}
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={segment.textColor}
            fontSize="12"
            fontWeight="bold"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {segment.label}
          </text>
        </g>
      );
    }

    return segments;
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="text-center">
        <p className="text-gray-300 text-sm mb-1">Крути колесо и выигрывай дни подписки!</p>
        <p className="text-xs text-gray-400">30 игр в день • Перезарядка каждые 48 минут</p>
      </div>

      {/* Колесо рулетки */}
      <div className="relative">
        {/* Указатель */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>

        {/* Колесо */}
        <div
          ref={wheelRef}
          className="relative"
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
          }}
        >
          <svg width="280" height="280" viewBox="0 0 300 300">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {createWheelSegments()}
            {/* Центральный круг */}
            <circle
              cx="150"
              cy="150"
              r="20"
              fill="#1F2937"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Кнопка для вращения */}
      <div className="text-center">
        {nextPlayTime ? (
          <div className="space-y-2">
            <p className="text-gray-300">Следующая игра через:</p>
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
            {isSpinning ? 'Крутится...' : isLoading ? 'Загрузка...' : 'Крутить колесо'}
          </button>
        )}
      </div>

      {/* Результат */}
      {result && (
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-lg font-semibold text-white">{result}</p>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="text-center p-4 bg-red-900 rounded-lg border border-red-600">
          <p className="text-red-200">
            {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
              ? (error.data as any).message
              : 'Произошла ошибка'}
          </p>
        </div>
      )}

      {/* Легенда */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">Призы:</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
            <span className="text-gray-300 font-semibold">1 день подписки</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
            <span className="text-gray-300 font-semibold">2 дня подписки</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-gray-400">Пусто</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;
