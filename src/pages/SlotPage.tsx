import React, { useState, useEffect, useRef } from 'react';
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

const SlotPage: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [completedReels, setCompletedReels] = useState(0);
  const auth = useAuth();

  const [playSlot, { isLoading }] = usePlaySlotMutation();

  const canPlay = !isSpinning && !isLoading && auth.user && Number(auth.user.balance || 0) >= 10;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            🎰 <span>Слот CS2</span> 🎰
          </h1>
          <p className="text-gray-300 text-lg">
            Собери три одинаковых предмета для выигрыша!
          </p>
        </div>

        {/* Основной игровой блок */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
            {/* Игровое поле */}
            <div className="flex justify-center gap-6 mb-8">
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
              <div className="mb-6 p-6 rounded-xl bg-gray-700/50 border border-gray-600">
                <div className="text-center text-white">
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-green-400 font-bold">
                      <div className="text-2xl mb-2">🎉 ВЫИГРЫШ! 🎉</div>
                      <div className="text-lg">Три одинаковых предмета!</div>
                      <div className="text-sm mt-2 text-green-300">
                        Вы получили: {result[0]?.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400">
                      <div className="text-xl mb-1">Не повезло в этот раз</div>
                      <div className="text-sm text-gray-400">
                        Попробуйте еще раз!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о игре */}
            <div className="mb-8 text-center space-y-3">
              <div className="text-lg text-gray-300">
                Стоимость спина: <span className="text-yellow-400 font-bold text-xl">10 ₽</span>
              </div>
              <div className="text-lg text-gray-300">
                Ваш баланс: <span className="text-green-400 font-bold text-xl">{Number(auth.user?.balance || 0).toFixed(2)} ₽</span>
              </div>
              <div className="text-sm text-gray-400 max-w-md mx-auto">
                Соберите 3 одинаковых предмета на одной линии для выигрыша!
                Чем реже предмет, тем больше выигрыш.
              </div>
            </div>

            {/* Кнопка спина */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`px-12 py-4 rounded-xl font-bold text-xl transition-all transform ${
                  canPlay
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading || isSpinning ? (
                  <span className="flex items-center gap-2">
                    🎰 <span>Крутится...</span>
                  </span>
                ) : (
                  'СПИН (10 ₽)'
                )}
              </button>

              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-4 text-center text-red-400">
                  Недостаточно средств для игры
                </div>
              )}

              {!auth.user && (
                <div className="mt-4 text-center text-yellow-400">
                  Войдите в аккаунт для игры
                </div>
              )}
            </div>
          </div>

          {/* Правила игры */}
          <div className="mt-8 bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-xl font-bold text-white mb-4 text-center">📋 Правила игры</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Соберите 3 одинаковых предмета для выигрыша</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Стоимость одного спина составляет 10 рублей</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Выигрыш зависит от редкости предмета</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Выигранные предметы добавляются в ваш инвентарь</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotPage;
