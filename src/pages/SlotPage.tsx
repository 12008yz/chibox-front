import React, { useState, useEffect, useRef } from 'react';
import { usePlaySlotMutation, useGetSlotItemsQuery } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';

// Создаем SVG заглушку для изображений (из ExchangePage)
const PlaceholderImage: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center`}>
    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// Функции для работы с редкостью (из ExchangePage)
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'from-yellow-400 to-orange-500';
    case 'classified': return 'from-purple-400 to-pink-500';
    case 'restricted': return 'from-blue-400 to-cyan-500';
    case 'milspec': return 'from-green-400 to-emerald-500';
    case 'industrial':
    case 'consumer': return 'from-gray-400 to-slate-500';
    default: return 'from-gray-400 to-slate-500';
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
        const itemHeight = 120; // Высота предмета в слоте
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
    <div className="relative w-32 h-40 overflow-hidden bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-2xl border-4 border-white shadow-2xl">
      {/* Градиентные круги как на скриншоте */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-8 h-8 bg-green-200 rounded-full top-2 left-2 opacity-60"></div>
        <div className="absolute w-6 h-6 bg-green-100 rounded-full top-6 right-3 opacity-40"></div>
        <div className="absolute w-4 h-4 bg-green-300 rounded-full bottom-4 left-4 opacity-50"></div>
        <div className="absolute w-10 h-10 bg-green-200 rounded-full bottom-2 right-2 opacity-30"></div>
      </div>

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
              className="h-28 w-full p-2 border-b border-white/20 flex flex-col items-center justify-center relative bg-white/10 backdrop-blur-sm"
            >
              {/* Изображение предмета */}
              <div className="relative mb-1 w-16 h-16 bg-black/20 rounded-xl overflow-hidden border-2 border-white/30">
                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-30 rounded-xl`}></div>
                {!imageErrors.has(item.id) && item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-contain mix-blend-normal z-10 p-1"
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
                <div className={`absolute -top-1 -right-1 px-1 py-0.5 rounded-md bg-gradient-to-r ${getRarityColor(item.rarity)} text-white text-xs font-bold z-20 scale-75 shadow-lg`}>
                  {getRarityDisplayName(item.rarity).slice(0, 3)}
                </div>
              </div>

              {/* Название предмета */}
              <div className="text-xs text-white text-center truncate w-full px-1 relative z-10 font-bold drop-shadow-md">
                {item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name}
              </div>

              {/* Цена */}
              <div className="text-xs text-white font-bold relative z-10 drop-shadow-md">
                <Monetary value={Number(item.price)} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Указатель результата - яркая желтая линия как на скриншоте */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent pointer-events-none shadow-lg z-30"
           style={{ transform: 'translateY(-50%)' }} />

      {/* Боковые подсветки */}
      <div className="absolute top-1/2 left-0 w-1 h-8 bg-yellow-300 pointer-events-none rounded-r z-30"
           style={{ transform: 'translateY(-50%)' }} />
      <div className="absolute top-1/2 right-0 w-1 h-8 bg-yellow-300 pointer-events-none rounded-l z-30"
           style={{ transform: 'translateY(-50%)' }} />
    </div>
  );
};

const SlotPage: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [completedReels, setCompletedReels] = useState(0);
  const [displayItems, setDisplayItems] = useState<SlotItem[]>([]);
  const auth = useAuth();

  // Получаем предметы для слота из API
  const { data: slotItemsData, isLoading: isLoadingItems, error: itemsError } = useGetSlotItemsQuery();
  const [playSlot, { isLoading }] = usePlaySlotMutation();

  // Когда получаем предметы из API, обновляем displayItems
  useEffect(() => {
    if (slotItemsData?.success && slotItemsData.data.items.length > 0) {
      setDisplayItems(slotItemsData.data.items);
    }
  }, [slotItemsData]);

  const canPlay = !isSpinning && !isLoading && auth.user && Number(auth.user.balance || 0) >= 10 && displayItems.length > 0;

  const handleSpin = async () => {
    if (!canPlay) {
      console.log('Cannot play:', { isSpinning, isLoading, hasUser: !!auth.user, balance: auth.user?.balance, itemsLoaded: displayItems.length > 0 });
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

        // Гарантированно сбрасываем состояние через 3.5 секунды (чуть больше анимации)
        setTimeout(() => {
          console.log('Resetting spin state...');
          setIsSpinning(false);
          setShowResult(true);

          if (response.result.isWin) {
            toast.success(`🎉 Поздравляем! Вы выиграли ${response.result.wonItem?.name}!`, {
              duration: 5000,
            });
          } else {
            toast('😔 Не повезло в этот раз', { icon: '🎰' });
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

  if (isLoadingItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl font-bold">Загружаем предметы слота...</div>
        </div>
      </div>
    );
  }

  if (itemsError || !slotItemsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/30">
          <div className="text-white text-xl font-bold mb-4">❌ Ошибка загрузки предметов</div>
          <div className="text-white/80">Попробуйте обновить страницу</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 py-8 relative overflow-hidden">
      {/* Фоновые декоративные круги как на скриншоте Ultra Fresh */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 bg-green-200 rounded-full top-10 left-10 animate-pulse"></div>
        <div className="absolute w-24 h-24 bg-green-100 rounded-full top-32 right-20 animate-pulse delay-1000"></div>
        <div className="absolute w-40 h-40 bg-green-300 rounded-full bottom-20 left-1/4 animate-pulse delay-2000"></div>
        <div className="absolute w-20 h-20 bg-green-200 rounded-full bottom-32 right-10 animate-pulse delay-500"></div>
        <div className="absolute w-16 h-16 bg-green-100 rounded-full top-1/2 left-1/3 animate-pulse delay-1500"></div>
        <div className="absolute w-28 h-28 bg-green-200 rounded-full top-20 right-1/3 animate-pulse delay-300"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Заголовок страницы в стиле Ultra Fresh */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white">
              <span className="text-white text-3xl">🎰</span>
            </div>
            <h1 className="text-5xl font-black text-white drop-shadow-2xl" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              ULTRA FRESH
            </h1>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white">
              <span className="text-white text-3xl">💎</span>
            </div>
          </div>
          <p className="text-white text-xl font-bold drop-shadow-lg">Собери 3 одинаковых предмета CS2 • Выиграй джекпот</p>
          <div className="mt-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-lg px-6 py-3 rounded-2xl border-2 border-white/40 shadow-xl">
            <span className="text-yellow-300 text-2xl">⚡</span>
            <span className="text-white font-bold text-lg">3 одинаковых = ДЖЕКПОТ!</span>
            <span className="text-yellow-300 text-2xl">⚡</span>
          </div>
        </div>

        {/* Основной игровой блок */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
            {/* Игровое поле в стиле Ultra Fresh */}
            <div className="bg-white/20 rounded-2xl p-6 mb-8 border-2 border-white/40 shadow-inner">
              <div className="flex justify-center gap-6 mb-4">
                {[0, 1, 2].map((reelIndex) => (
                  <Reel
                    key={reelIndex}
                    items={displayItems}
                    isSpinning={isSpinning}
                    finalItem={result[reelIndex]}
                    delay={reelIndex * 200} // Задержка между барабанами
                    onSpinComplete={handleReelComplete}
                  />
                ))}
              </div>

              {/* Индикатор выигрышной линии */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent h-1 w-full max-w-lg rounded-full shadow-lg"></div>
              </div>
            </div>

            {/* Результат */}
            {showResult && result.length === 3 && (
              <div className="mb-6 p-6 rounded-2xl bg-white/20 backdrop-blur-lg border-2 border-white/40 shadow-xl">
                <div className="text-center text-white">
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-yellow-300 font-black">
                      <div className="text-4xl mb-4 animate-bounce">🎉 ДЖЕКПОТ! 🎉</div>
                      <div className="text-2xl mb-3 font-bold">Три одинаковых предмета!</div>
                      <div className="bg-yellow-400/20 rounded-2xl p-6 mt-4 border-2 border-yellow-400/50 shadow-xl">
                        <div className="text-xl text-yellow-200 mb-2 font-bold">Вы выиграли:</div>
                        <div className="text-2xl font-black text-yellow-100">{result[0]?.name}</div>
                        <div className="text-xl text-yellow-200 mt-2 font-bold">Стоимость: <Monetary value={Number(result[0]?.price || 0)} /></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-orange-300 text-2xl mb-3 font-bold">🎰 Не повезло в этот раз</div>
                      <div className="text-lg text-white/80 mb-4 font-semibold">
                        Попробуйте еще раз! Удача обязательно повернется к вам лицом.
                      </div>
                      <div className="bg-orange-400/20 rounded-2xl p-4 border-2 border-orange-400/30 shadow-lg">
                        <div className="text-lg text-orange-200 font-bold">
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
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-400/50 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="text-yellow-300 text-3xl">🎰</div>
                  <div>
                    <div className="text-yellow-300 text-sm font-bold uppercase tracking-wide">Стоимость спина</div>
                    <div className="text-white text-2xl font-black">10 ₽</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-green-400/50 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="text-green-300 text-3xl">💰</div>
                  <div>
                    <div className="text-green-300 text-sm font-bold uppercase tracking-wide">Ваш баланс</div>
                    <div className="text-white text-2xl font-black"><Monetary value={Number(auth.user?.balance || 0)} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-400/50 max-w-lg mx-auto shadow-xl">
                <div className="text-lg text-purple-200 mb-3 font-bold">💡 Правило победы</div>
                <div className="text-white text-lg font-semibold">
                  Соберите 3 одинаковых предмета CS2 на одной линии для выигрыша!
                  <br />
                  Чем реже предмет, тем больше выигрыш.
                </div>
              </div>
            </div>

            {/* Кнопка спина в стиле Ultra Fresh */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`px-20 py-6 rounded-2xl font-black text-2xl transition-all transform shadow-2xl border-4 ${
                  canPlay
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white border-white hover:shadow-3xl hover:scale-105 active:scale-95'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-500'
                }`}
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                {isLoading || isSpinning ? (
                  <span className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white"></div>
                    <span>КРУТИТСЯ...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    🎰 <span>СТАРТ (10 ₽)</span> 🎰
                  </span>
                )}
              </button>

              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-6 p-4 bg-red-400/20 border-2 border-red-400/50 rounded-2xl text-red-200 max-w-md mx-auto shadow-xl">
                  <div className="font-bold text-lg">❌ Недостаточно средств для игры</div>
                </div>
              )}

              {!auth.user && (
                <div className="mt-6 p-4 bg-yellow-400/20 border-2 border-yellow-400/50 rounded-2xl text-yellow-200 max-w-md mx-auto shadow-xl">
                  <div className="font-bold text-lg">🔐 Войдите в аккаунт для игры</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-6 p-4 bg-blue-400/20 border-2 border-blue-400/50 rounded-2xl text-blue-200 max-w-md mx-auto shadow-xl">
                  <div className="font-bold text-lg">⏳ Загружаем предметы...</div>
                </div>
              )}
            </div>
          </div>

          {/* Правила игры */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/30 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white">Правила игры</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-green-400/50 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-green-300 text-2xl">🎯</span>
                  <span className="text-green-200 font-bold text-lg">Как выиграть</span>
                </div>
                <p className="text-white text-lg font-semibold">Соберите 3 одинаковых предмета CS2 на центральной линии</p>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-400/50 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-yellow-300 text-2xl">💰</span>
                  <span className="text-yellow-200 font-bold text-lg">Стоимость</span>
                </div>
                <p className="text-white text-lg font-semibold">Один спин стоит 10 рублей</p>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-400/50 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-purple-300 text-2xl">💎</span>
                  <span className="text-purple-200 font-bold text-lg">Редкость</span>
                </div>
                <p className="text-white text-lg font-semibold">Чем реже предмет CS2, тем больше его ценность</p>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-400/50 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-blue-300 text-2xl">🎒</span>
                  <span className="text-blue-200 font-bold text-lg">Инвентарь</span>
                </div>
                <p className="text-white text-lg font-semibold">Выигранные предметы попадают в ваш инвентарь</p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-orange-400/20 rounded-2xl border-2 border-orange-400/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-orange-300 text-2xl">⚠️</span>
                <span className="text-orange-200 font-bold text-lg">Важно</span>
              </div>
              <p className="text-white text-lg font-semibold">
                Слот-машина использует честную систему случайности.
                Каждый спин независим от предыдущих результатов.
                Предметы получаются из вашей коллекции CS2.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotPage;
