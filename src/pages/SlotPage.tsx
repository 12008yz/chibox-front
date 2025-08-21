import React, { useState, useEffect, useRef } from 'react';
import { usePlaySlotMutation } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';

// Создаем SVG заглушку для изображений (из ExchangePage)
const PlaceholderImage: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center`}>
    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// Функции для работы с редкостью (из ExchangePage)
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'from-yellow-500 to-orange-500';
    case 'classified': return 'from-purple-500 to-pink-500';
    case 'restricted': return 'from-blue-500 to-cyan-500';
    case 'milspec': return 'from-green-500 to-emerald-500';
    case 'industrial':
    case 'consumer': return 'from-gray-500 to-slate-500';
    default: return 'from-gray-500 to-slate-500';
  }
};

const getRarityDisplayName = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert': return 'СЕКРЕТНОЕ';
    case 'classified': return 'ЗАСЕКРЕЧЕННОЕ';
    case 'restricted': return 'ЗАПРЕЩЁННОЕ';
    case 'milspec': return 'АРМЕЙСКОЕ';
    case 'industrial': return 'ПРОМЫШЛЕННОЕ';
    case 'consumer': return 'ПОТРЕБИТЕЛЬСКОЕ';
    case 'contraband': return 'КОНТРАБАНДА';
    default: return rarity?.toUpperCase() || 'ОБЫЧНОЕ';
  }
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const reelRef = useRef<HTMLDivElement>(null);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  useEffect(() => {
    if (isSpinning && finalItem) {
      // Задержка перед началом вращения
      const delayTimeout = setTimeout(() => {
        // Анимация кручения
        const spins = 5; // Количество полных оборотов
        const itemHeight = 140; // Увеличенная высота предмета
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
    <div className="relative w-36 h-48 overflow-hidden bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-xl border-2 border-purple-500/30 shadow-lg">
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
              className="h-32 w-full p-3 border-b border-purple-800/30 flex flex-col items-center justify-center relative"
            >
              {/* Градиентный фон редкости */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-10 rounded-lg`}></div>

              {/* Изображение предмета */}
              <div className="relative mb-2 w-20 h-20 bg-black/10 rounded-lg overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20 rounded-lg`}></div>
                {!imageErrors.has(item.id) && item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-contain mix-blend-normal z-10"
                    onError={() => handleImageError(item.id)}
                    style={{
                      backgroundColor: 'transparent',
                      filter: 'none'
                    }}
                  />
                ) : (
                  <PlaceholderImage className="w-full h-full" />
                )}
                {/* Редкость бейдж */}
                <div className={`absolute -top-1 -right-1 px-1 py-0.5 rounded-md bg-gradient-to-r ${getRarityColor(item.rarity)} text-white text-xs font-bold z-20 scale-75`}>
                  {getRarityDisplayName(item.rarity).slice(0, 3)}
                </div>
              </div>

              {/* Название предмета */}
              <div className="text-xs text-white text-center truncate w-full px-1 relative z-10">
                {item.name.length > 14 ? `${item.name.substring(0, 14)}...` : item.name}
              </div>

              {/* Цена */}
              <div className="text-xs text-purple-300 font-semibold relative z-10">
                <Monetary value={Number(item.price)} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Указатель результата */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent pointer-events-none shadow-lg"
           style={{ transform: 'translateY(-50%)' }} />

      {/* Боковые подсветки */}
      <div className="absolute top-1/2 left-0 w-1 h-8 bg-yellow-400 pointer-events-none rounded-r"
           style={{ transform: 'translateY(-50%)' }} />
      <div className="absolute top-1/2 right-0 w-1 h-8 bg-yellow-400 pointer-events-none rounded-l"
           style={{ transform: 'translateY(-50%)' }} />
    </div>
  );
};

const SlotPage: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [completedReels, setCompletedReels] = useState(0);
  const [displayItems, setDisplayItems] = useState<SlotItem[]>(placeholderItems);
  const auth = useAuth();

  const [playSlot, { isLoading }] = usePlaySlotMutation();

  const canPlay = !isSpinning && !isLoading && auth.user && Number(auth.user.balance || 0) >= 10;

  const handleSpin = async () => {
    if (!canPlay) {
      console.log('Cannot play:', { isSpinning, isLoading, hasUser: !!auth.user, balance: auth.user?.balance });
      return;
    }

    console.log('Starting spin...');
    try {
      setIsSpinning(true);
      setShowResult(false);
      setCompletedReels(0);

      const response = await playSlot().unwrap();
      console.log('Spin response:', response);

      if (response.success && response.result) {
        setResult(response.result.items);

        // Создаем массив для барабанов, включающий результат и заглушки
        const reelItems = [...placeholderItems, ...response.result.items].slice(0, 8);
        setDisplayItems(reelItems);

        // Гарантированно сбрасываем состояние через 3.5 секунды (чуть больше анимации)
        setTimeout(() => {
          console.log('Resetting spin state...');
          setIsSpinning(false);
          setShowResult(true);

          if (response.result.isWin) {
            toast.success(`Поздравляем! Вы выиграли ${response.result.wonItem?.name}!`, {
              duration: 5000,
            });
          } else {
            toast('Не повезло в этот раз', { icon: '😔' });
          }
        }, 3500);
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
    // Упрощенная логика - основной сброс состояния происходит в handleSpin через таймаут
  };

  return (
    <div className="min-h-screen bg-[#151225] py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🎰</span>
            </div>
            <h1 className="text-4xl font-bold text-white">СЛОТ CS2</h1>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💎</span>
            </div>
          </div>
          <p className="text-gray-400 text-lg">Испытай удачу • Собери джекпот • Выиграй скины</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-4 py-2 rounded-lg border border-yellow-500/30">
            <span className="text-yellow-400">⚡</span>
            <span className="text-yellow-300 font-medium">3 одинаковых предмета = ДЖЕКПОТ!</span>
            <span className="text-yellow-400">⚡</span>
          </div>
        </div>

        {/* Основной игровой блок */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            {/* Игровое поле */}
            <div className="bg-black/20 rounded-xl p-6 mb-8 border border-purple-800/30">
              <div className="flex justify-center gap-8 mb-4">
                {[0, 1, 2].map((reelIndex) => (
                  <Reel
                    key={reelIndex}
                    items={displayItems}
                    isSpinning={isSpinning}
                    finalItem={result[reelIndex]}
                    delay={reelIndex * 300} // Задержка между барабанами
                    onSpinComplete={handleReelComplete}
                  />
                ))}
              </div>

              {/* Индикатор выигрышной линии */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent h-0.5 w-full max-w-md"></div>
              </div>
            </div>

            {/* Результат */}
            {showResult && result.length === 3 && (
              <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 shadow-lg">
                <div className="text-center text-white">
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-green-400 font-bold">
                      <div className="text-3xl mb-3 animate-pulse">🎉 ДЖЕКПОТ! 🎉</div>
                      <div className="text-xl mb-2">Три одинаковых предмета!</div>
                      <div className="bg-green-500/20 rounded-lg p-4 mt-4 border border-green-500/30">
                        <div className="text-lg text-green-300 mb-1">Вы выиграли:</div>
                        <div className="text-xl font-bold text-green-200">{result[0]?.name}</div>
                        <div className="text-lg text-green-300 mt-1">Стоимость: <Monetary value={Number(result[0]?.price || 0)} /></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-orange-400 text-xl mb-2">🎰 Не повезло в этот раз</div>
                      <div className="text-sm text-gray-400 mb-4">
                        Попробуйте еще раз! Удача обязательно повернется к вам лицом.
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                        <div className="text-sm text-orange-300">
                          Выпало: {result.map(item => item?.name?.split(' ')[0] || '?').join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о игре */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/50">
                <div className="flex items-center space-x-3">
                  <div className="text-yellow-400 text-2xl">🎰</div>
                  <div>
                    <div className="text-yellow-400 text-sm font-medium">СТОИМОСТЬ СПИНА</div>
                    <div className="text-white text-xl font-bold">10 ₽</div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4 border border-green-500/50">
                <div className="flex items-center space-x-3">
                  <div className="text-green-400 text-2xl">💰</div>
                  <div>
                    <div className="text-green-400 text-sm font-medium">ВАШ БАЛАНС</div>
                    <div className="text-white text-xl font-bold"><Monetary value={Number(auth.user?.balance || 0)} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30 max-w-md mx-auto">
                <div className="text-sm text-purple-300 mb-2">💡 Правило победы</div>
                <div className="text-white text-sm">
                  Соберите 3 одинаковых предмета на одной линии для выигрыша!
                  Чем реже предмет, тем больше выигрыш.
                </div>
              </div>
            </div>

            {/* Кнопка спина */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`px-16 py-5 rounded-xl font-bold text-xl transition-all transform shadow-lg ${
                  canPlay
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading || isSpinning ? (
                  <span className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Крутится...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🎰 <span>СПИН (10 ₽)</span> 🎰
                  </span>
                )}
              </button>

              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 max-w-sm mx-auto">
                  ❌ Недостаточно средств для игры
                </div>
              )}

              {!auth.user && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 max-w-sm mx-auto">
                  🔐 Войдите в аккаунт для игры
                </div>
              )}
            </div>
          </div>

          {/* Правила игры */}
          <div className="mt-8 bg-gradient-to-r from-[#1a1426] to-[#2a1a3a] backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Правила игры</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400 text-lg">🎯</span>
                  <span className="text-green-300 font-semibold">Как выиграть</span>
                </div>
                <p className="text-gray-300 text-sm">Соберите 3 одинаковых предмета на центральной линии</p>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-lg">💰</span>
                  <span className="text-yellow-300 font-semibold">Стоимость</span>
                </div>
                <p className="text-gray-300 text-sm">Один спин стоит 10 рублей</p>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400 text-lg">💎</span>
                  <span className="text-purple-300 font-semibold">Редкость</span>
                </div>
                <p className="text-gray-300 text-sm">Чем реже предмет, тем больше его ценность</p>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400 text-lg">🎒</span>
                  <span className="text-blue-300 font-semibold">Инвентарь</span>
                </div>
                <p className="text-gray-300 text-sm">Выигранные предметы попадают в ваш инвентарь</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-400 text-lg">⚠️</span>
                <span className="text-orange-300 font-semibold">Важно</span>
              </div>
              <p className="text-gray-300 text-sm">
                Слот-машина использует честную систему случайности.
                Каждый спин независим от предыдущих результатов.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotPage;
