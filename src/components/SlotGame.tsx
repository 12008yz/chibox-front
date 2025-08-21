import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePlaySlotMutation } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import type { SlotItem } from '../types/api';

// Цвета раритетности CS2
const rarityColors = {
  consumer: '#b0c3d9',      // Потребительского уровня (светло-синий)
  industrial: '#5e98d9',    // Промышленного уровня (синий)
  milspec: '#4b69ff',       // Армейского качества (тёмно-синий)
  restricted: '#8847ff',    // Запрещённое (фиолетовый)
  classified: '#d32ce6',    // Засекреченное (розовый)
  covert: '#eb4b4b',        // Тайное (красный)
  contraband: '#e4ae39',    // Контрабанда (жёлтый)
  exotic: '#ffd700'         // Экзотическое (золотой)
};

// Заглушечные предметы для анимации (будут заменены на реальные из API)
const placeholderItems: SlotItem[] = [
  { id: '1', name: 'AK-47 | Redline', image_url: '/placeholder-ak47.jpg', rarity: 'classified', price: 45.50 },
  { id: '2', name: 'AWP | Dragon Lore', image_url: '/placeholder-awp.jpg', rarity: 'covert', price: 2800.00 },
  { id: '3', name: 'Glock-18 | Water Elemental', image_url: '/placeholder-glock.jpg', rarity: 'restricted', price: 12.30 },
  { id: '4', name: 'M4A4 | Howl', image_url: '/placeholder-m4a4.jpg', rarity: 'contraband', price: 5000.00 },
  { id: '5', name: 'Karambit | Fade', image_url: '/placeholder-karambit.jpg', rarity: 'covert', price: 1200.00 },
];

interface SlotGameProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface ReelProps {
  items: SlotItem[];
  isSpinning: boolean;
  finalItem?: SlotItem;
  delay: number;
  onSpinComplete: () => void;
}

const Reel: React.FC<ReelProps> = ({ items, isSpinning, finalItem, delay, onSpinComplete }) => {
  const [currentOffset, setCurrentOffset] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSpinning && finalItem) {
      // Задержка перед началом вращения
      const delayTimeout = setTimeout(() => {
        // Анимация кручения
        const spins = 5; // Количество полных оборотов
        const itemHeight = 120; // Высота одного предмета
        const finalIndex = items.findIndex(item => item.id === finalItem.id);
        const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight;

        setCurrentOffset(-totalOffset);

        // Завершение анимации
        setTimeout(() => {
          onSpinComplete();
        }, 2500); // Длительность анимации
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isSpinning, finalItem, delay, items, onSpinComplete]);

  return (
    <div className="relative w-24 h-36 overflow-hidden bg-gray-800 rounded-lg border-2 border-gray-700">
      <div
        ref={reelRef}
        className={`transition-transform ${isSpinning ? 'duration-[2500ms] ease-out' : 'duration-0'}`}
        style={{ transform: `translateY(${currentOffset}px)` }}
      >
        {/* Повторяем предметы несколько раз для эффекта бесконечности */}
        {Array.from({ length: 8 }, (_, repeatIndex) =>
          items.map((item, index) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className="h-28 w-full p-2 border-b border-gray-600 flex flex-col items-center justify-center"
              style={{ backgroundColor: `${rarityColors[item.rarity]}20` }}
            >
              <div className="w-16 h-16 bg-gray-700 rounded-lg mb-1 flex items-center justify-center">
                {item.image_url !== '/placeholder-ak47.jpg' ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded flex items-center justify-center text-xs text-white font-bold"
                    style={{ backgroundColor: rarityColors[item.rarity] }}
                  >
                    {item.name.split(' ')[0]}
                  </div>
                )}
              </div>
              <div className="text-xs text-white text-center truncate w-full">
                {item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Указатель результата */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 pointer-events-none"
           style={{ transform: 'translateY(-50%)' }} />
    </div>
  );
};

const SlotGame: React.FC<SlotGameProps> = ({ isOpen, onClose, className = '' }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [completedReels, setCompletedReels] = useState(0);
  const auth = useAuth();

  const [playSlot, { isLoading }] = usePlaySlotMutation();

  const canPlay = !isSpinning && !isLoading && auth.user && auth.user.balance >= 10;

  const handleSpin = async () => {
    if (!canPlay) return;

    try {
      setIsSpinning(true);
      setShowResult(false);
      setCompletedReels(0);

      const response = await playSlot().unwrap();

      if (response.success && response.result) {
        setResult(response.result.items);

        // Показываем результат после завершения всех барабанов
        setTimeout(() => {
          setShowResult(true);

          if (response.result.isWin) {
            toast.success(`Поздравляем! Вы выиграли ${response.result.wonItem?.name}!`, {
              duration: 5000,
            });
          } else {
            toast('Не повезло в этот раз', { icon: '😔' });
          }
        }, 3000);
      } else {
        setIsSpinning(false);
        toast.error(response.message || 'Что-то пошло не так');
      }
    } catch (err: any) {
      setIsSpinning(false);
      console.error('Ошибка при игре в слот:', err);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleReelComplete = () => {
    setCompletedReels(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        setIsSpinning(false);
      }
      return newCount;
    });
  };

  const handleClose = () => {
    if (!isSpinning) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🎰 Слот CS2</h2>
          <button
            onClick={handleClose}
            disabled={isSpinning}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Игровое поле */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2].map((reelIndex) => (
            <Reel
              key={reelIndex}
              items={placeholderItems}
              isSpinning={isSpinning}
              finalItem={result[reelIndex]}
              delay={reelIndex * 300} // Задержка между барабанами
              onSpinComplete={handleReelComplete}
            />
          ))}
        </div>

        {/* Результат */}
        {showResult && result.length === 3 && (
          <div className="mb-4 p-4 rounded-lg bg-gray-800">
            <div className="text-center text-white">
              {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                <div className="text-green-400 font-bold">
                  🎉 ВЫИГРЫШ! 🎉
                  <div className="text-sm mt-1">Три одинаковых предмета!</div>
                </div>
              ) : (
                <div className="text-red-400">
                  Не повезло в этот раз
                </div>
              )}
            </div>
          </div>
        )}

        {/* Информация */}
        <div className="mb-6 text-center text-gray-300">
          <div className="text-sm mb-2">
            Стоимость спина: <span className="text-yellow-400 font-bold">10 ₽</span>
          </div>
          <div className="text-sm mb-2">
            Ваш баланс: <span className="text-green-400 font-bold">{auth.user?.balance?.toFixed(2)} ₽</span>
          </div>
          <div className="text-xs text-gray-400">
            Соберите 3 одинаковых предмета для выигрыша!
          </div>
        </div>

        {/* Кнопка спина */}
        <button
          onClick={handleSpin}
          disabled={!canPlay}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all ${
            canPlay
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading || isSpinning ? '🎰 Крутится...' : 'СПИН (10 ₽)'}
        </button>

        {!canPlay && auth.user && auth.user.balance < 10 && (
          <div className="mt-3 text-center text-red-400 text-sm">
            Недостаточно средств для игры
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SlotGame;
