import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { usePlayPlinkoMutation, useGetPlinkoStatusQuery } from '../features/user/userApi';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/soundManager';

interface PlinkoGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: string; value: number; slotIndex: number } | null>(null);

  const { data: plinkoStatus, refetch: refetchStatus } = useGetPlinkoStatusQuery();
  const [playPlinko, { isLoading }] = usePlayPlinkoMutation();

  // Константы для игры
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PEG_RADIUS = 4;
  const BALL_RADIUS = 8;
  const SLOT_WIDTH = CANVAS_WIDTH / 17; // 17 слотов
  const ROWS = 12;

  const canPlay = !isDropping && !isLoading && (plinkoStatus?.remaining_attempts || 0) > 0;

  // Инициализация Matter.js
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    // Создаем движок
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 }
    });
    engineRef.current = engine;

    // Создаем рендерер
    const render = Matter.Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Создаем колышки (pegs) в шахматном порядке
    const pegs: Matter.Body[] = [];
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3;
      const rowY = 100 + row * 40;
      const offsetX = CANVAS_WIDTH / 2 - (pegsInRow * 30) / 2;

      for (let col = 0; col < pegsInRow; col++) {
        const peg = Matter.Bodies.circle(
          offsetX + col * 30 + (row % 2 === 0 ? 15 : 0),
          rowY,
          PEG_RADIUS,
          {
            isStatic: true,
            render: {
              fillStyle: '#8B5CF6',
              strokeStyle: '#A78BFA',
              lineWidth: 2
            },
            friction: 0.1,
            restitution: 0.5
          }
        );
        pegs.push(peg);
      }
    }

    // Создаем стены
    const walls = [
      // Левая стена
      Matter.Bodies.rectangle(0, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, {
        isStatic: true,
        render: { fillStyle: '#4C1D95' }
      }),
      // Правая стена
      Matter.Bodies.rectangle(CANVAS_WIDTH, CANVAS_HEIGHT / 2, 20, CANVAS_HEIGHT, {
        isStatic: true,
        render: { fillStyle: '#4C1D95' }
      }),
      // Нижняя стена
      Matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT, CANVAS_WIDTH, 20, {
        isStatic: true,
        render: { fillStyle: '#4C1D95' }
      })
    ];

    // Создаем разделители слотов
    const dividers: Matter.Body[] = [];
    for (let i = 0; i <= 17; i++) {
      const divider = Matter.Bodies.rectangle(
        i * SLOT_WIDTH,
        CANVAS_HEIGHT - 60,
        2,
        120,
        {
          isStatic: true,
          render: {
            fillStyle: '#6366F1',
            opacity: 0.5
          }
        }
      );
      dividers.push(divider);
    }

    // Добавляем все тела в мир
    Matter.World.add(engine.world, [...pegs, ...walls, ...dividers]);

    // Запускаем рендерер и движок
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, [isOpen]);

  // Бросаем шарик
  const handleDrop = async () => {
    if (!canPlay || !engineRef.current) return;

    try {
      // Запрашиваем результат с сервера
      const response = await playPlinko().unwrap();

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setIsDropping(true);

      // Создаем шарик
      const randomX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 20;
      const ball = Matter.Bodies.circle(randomX, 50, BALL_RADIUS, {
        restitution: 0.5,
        friction: 0.01,
        density: 0.001,
        render: {
          fillStyle: response.prize_type === 'status' ? '#F59E0B' : '#10B981',
          strokeStyle: '#FFF',
          lineWidth: 2
        }
      });

      ballRef.current = ball;
      Matter.World.add(engineRef.current.world, ball);

      // Воспроизводим звук
      soundManager.play('process');

      // Отслеживаем когда шарик упадет в слот
      const checkInterval = setInterval(() => {
        if (ball.position.y > CANVAS_HEIGHT - 100 && Math.abs(ball.velocity.y) < 0.5) {
          clearInterval(checkInterval);

          // Вычисляем в какой слот упал
          const slotIndex = Math.floor(ball.position.x / SLOT_WIDTH);

          // Показываем результат
          setLastResult({
            type: response.prize_type,
            value: response.prize_type === 'coins' ? response.prize_amount : response.status_days,
            slotIndex: response.slot_index
          });

          // Звук выигрыша
          if (response.prize_type === 'status') {
            soundManager.play('win');
            toast.success(response.message, {
              icon: '🎉',
              duration: 4000,
            });
          } else {
            soundManager.play('win');
            toast.success(response.message, {
              icon: '💰',
              duration: 3000,
            });
          }

          // Удаляем шарик через секунду
          setTimeout(() => {
            if (ballRef.current && engineRef.current) {
              Matter.World.remove(engineRef.current.world, ballRef.current);
              ballRef.current = null;
            }
            setIsDropping(false);
            refetchStatus();
          }, 1000);
        }
      }, 100);

    } catch (err: any) {
      console.error('Ошибка Plinko:', err);
      toast.error(err.data?.message || 'Произошла ошибка');
      setIsDropping(false);
    }
  };

  // Предотвращаем скроллинг страницы
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 rounded-2xl shadow-2xl max-w-5xl w-full border-2 border-purple-500/30 overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-purple-600/50 to-pink-600/50 border-b border-purple-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-1">
              🎯 Plinko Game
            </h2>
            <p className="text-purple-200 text-sm">
              Бросайте шарик и выигрывайте призы!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Статистика */}
          <div className="mb-4 flex justify-between items-center">
            <div className="bg-purple-800/50 px-4 py-2 rounded-lg border border-purple-500/30">
              <p className="text-purple-200 text-xs">Осталось попыток</p>
              <p className="text-2xl font-bold text-white">
                {plinkoStatus?.remaining_attempts || 0}
              </p>
            </div>

            {lastResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg"
              >
                <p className="text-white font-bold text-lg">
                  {lastResult.type === 'status'
                    ? `🎉 ${lastResult.value} ${lastResult.value === 1 ? 'день' : 'дня'} статуса!`
                    : `💰 ${lastResult.value} рублей!`
                  }
                </p>
              </motion.div>
            )}

            <div className="bg-purple-800/50 px-4 py-2 rounded-lg border border-purple-500/30">
              <p className="text-purple-200 text-xs">Занято слотов</p>
              <p className="text-2xl font-bold text-white">
                {plinkoStatus?.occupied_slots?.length || 0}/{plinkoStatus?.total_slots || 17}
              </p>
            </div>
          </div>

          {/* Игровое поле */}
          <div className="relative bg-gradient-to-b from-purple-950 to-purple-900 rounded-xl overflow-hidden border-2 border-purple-500/30">
            <div ref={canvasRef} className="flex justify-center" />

            {/* Слоты внизу */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {plinkoStatus?.all_slots.map((slot, index) => (
                <div
                  key={index}
                  className={`flex-1 h-16 flex items-center justify-center text-xs font-bold border-l border-purple-500/30 transition-all ${
                    slot.occupied
                      ? 'bg-gray-800/90 text-gray-500'
                      : slot.type === 'status'
                      ? 'bg-gradient-to-t from-yellow-600/80 to-yellow-500/80 text-yellow-100'
                      : 'bg-gradient-to-t from-green-600/80 to-green-500/80 text-green-100'
                  }`}
                >
                  {slot.occupied ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xl">🔒</span>
                      <span className="text-[8px]">Занято</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-sm">
                        {slot.type === 'status' ? '👑' : '💰'}
                      </span>
                      <span className="text-[10px]">
                        {slot.type === 'status'
                          ? `${slot.value}д`
                          : `${slot.value}₽`
                        }
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Кнопка броска */}
          <div className="mt-6 text-center">
            {plinkoStatus?.game_completed ? (
              <div className="bg-purple-800/50 px-6 py-4 rounded-lg border border-purple-500/30">
                <p className="text-xl font-bold text-white mb-2">🎊 Игра завершена!</p>
                <p className="text-purple-200 text-sm">Все слоты заняты. Поздравляем!</p>
              </div>
            ) : (
              <button
                onClick={handleDrop}
                disabled={!canPlay}
                className={`px-12 py-4 rounded-xl font-bold text-lg transition-all transform ${
                  canPlay
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-105 animate-pulse'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isDropping ? '🎲 Падает...' : isLoading ? '⏳ Загрузка...' : '🚀 Бросить шарик'}
              </button>
            )}
          </div>

          {/* Подсказка */}
          <div className="mt-4 text-center text-xs text-purple-300">
            <p>💡 Физика реального шарика - каждый бросок уникален!</p>
            <p className="mt-1">🎁 Выиграйте дни статуса или монетки</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PlinkoGame;
