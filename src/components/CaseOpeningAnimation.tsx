import React, { useState, useEffect, useRef } from 'react';
import type { Item, CaseTemplate } from '../types/api';
import { useGetCaseItemsQuery } from '../features/cases/casesApi';

interface CaseOpeningAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  caseTemplate: CaseTemplate | null;
  wonItem: Item | null;
  isLoading: boolean;
}

const CaseOpeningAnimation: React.FC<CaseOpeningAnimationProps> = ({
  isOpen,
  onClose,
  caseTemplate,
  wonItem,
  isLoading
}) => {
  const [animationStage, setAnimationStage] = useState<'starting' | 'rolling' | 'stopping' | 'revealing' | 'showing'>('starting');
  const [showFireworks, setShowFireworks] = useState(false);
  const [rollingItems, setRollingItems] = useState<Item[]>([]);
  const [sliderPosition, setSliderPosition] = useState(0);
  const rollingRef = useRef<HTMLDivElement>(null);

  // Получаем реальные предметы из кейса
  const { data: caseItemsData } = useGetCaseItemsQuery(
    caseTemplate?.id || '',
    { skip: !caseTemplate?.id }
  );

  // Создаем массив предметов для анимации прокрутки
  useEffect(() => {
    if (isOpen && wonItem && caseItemsData?.success) {
      const caseItems = caseItemsData.data.items || [];

      if (caseItems.length > 0) {
        const rollingItemsArray: Item[] = [];

        // Создаем длинную прокрутку из реальных предметов кейса
        // Повторяем предметы кейса несколько раз для эффекта длинной рулетки
        for (let round = 0; round < 5; round++) {
          caseItems.forEach((item) => {
            rollingItemsArray.push({
              ...item,
              id: `rolling-${round}-${item.id}` // Уникальный ID для каждого экземпляра
            });
          });
        }

        // Добавляем еще несколько случайных предметов из кейса
        for (let i = 0; i < 10; i++) {
          const randomCaseItem = caseItems[Math.floor(Math.random() * caseItems.length)];
          rollingItemsArray.push({
            ...randomCaseItem,
            id: `extra-rolling-${i}-${randomCaseItem.id}`
          });
        }

        // Добавляем выигранный предмет в конец для корректной остановки
        rollingItemsArray.push({
          ...wonItem,
          id: `winner-${wonItem.id}`
        });

        setRollingItems(rollingItemsArray);
      }
    }
  }, [isOpen, wonItem, caseItemsData]);

  useEffect(() => {
    if (isOpen && !isLoading && wonItem) {
      console.log('Starting enhanced case animation with item:', wonItem.name);

      // Фаза 1: Начинаем прокрутку со слайдером
      setTimeout(() => {
        console.log('Animation stage: rolling');
        setAnimationStage('rolling');
        // Начинаем движение слайдера
        startSliderAnimation();
      }, 500);

      // Фаза 2: Замедляем прокрутку и останавливаем на выигранном предмете
      setTimeout(() => {
        console.log('Animation stage: stopping');
        setAnimationStage('stopping');
      }, 3000);

      // Фаза 3: Показываем результат
      setTimeout(() => {
        console.log('Animation stage: revealing');
        setAnimationStage('revealing');
      }, 5000);

      // Фаза 4: Финальное отображение с эффектами
      setTimeout(() => {
        console.log('Animation stage: showing');
        setAnimationStage('showing');
        setShowFireworks(true);
      }, 5500);

      setTimeout(() => setShowFireworks(false), 8000);
    }
  }, [isOpen, isLoading, wonItem]);

  // Анимация движения слайдера с фокусом камеры
  const startSliderAnimation = () => {
    let position = 0;
    let speed = 3; // начальная скорость
    let lastTime = 0;
    const FPS_LIMIT = 60;
    const frameTime = 1000 / FPS_LIMIT;
    const itemWidth = 80; // ширина каждого предмета с отступами
    const totalItems = rollingItems.length;
    const maxPosition = (totalItems - 2) * itemWidth; // позиция выигранного предмета

    const animateSlider = (currentTime: number) => {
      // Ограничение FPS
      if (currentTime - lastTime < frameTime) {
        requestAnimationFrame(animateSlider);
        return;
      }

      lastTime = currentTime;

      // Принудительная остановка анимации
      if (animationStage === 'revealing' || animationStage === 'showing') {
        return;
      }

      // Замедляем при приближении к концу (stopping stage)
      if (animationStage === 'stopping') {
        const remainingDistance = maxPosition - position;
        if (remainingDistance > 0) {
          speed = Math.max(0.5, speed * 0.98); // плавное замедление
          position += speed;

          // Останавливаемся на выигранном предмете
          if (position >= maxPosition) {
            position = maxPosition;
          }
        }
      } else if (animationStage === 'rolling') {
        // Обычная скорость прокрутки
        position += speed;
        // Циклическая прокрутка для эффекта бесконечности
        if (position > totalItems * itemWidth / 2) {
          position = position - (totalItems * itemWidth / 3);
        }
      }

      setSliderPosition(position);

      if ((animationStage === 'rolling' || animationStage === 'stopping') && position < maxPosition + 10) {
        requestAnimationFrame(animateSlider);
      }
    };

    requestAnimationFrame(animateSlider);
  };

  useEffect(() => {
    if (isOpen) {
      console.log('Enhanced case opening animation started');
      setAnimationStage('starting');
      setShowFireworks(false);
      setSliderPosition(0);
    } else {
      console.log('Enhanced case opening animation closed');
    }
  }, [isOpen]);

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'consumer': return 'from-gray-500 to-gray-600';
      case 'industrial': return 'from-blue-500 to-blue-600';
      case 'milspec': return 'from-purple-500 to-purple-600';
      case 'restricted': return 'from-pink-500 to-pink-600';
      case 'classified': return 'from-red-500 to-red-600';
      case 'covert': return 'from-yellow-500 to-orange-500';
      case 'contraband': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'consumer': return 'Потребительское';
      case 'industrial': return 'Промышленное';
      case 'milspec': return 'Армейское';
      case 'restricted': return 'Запрещённое';
      case 'classified': return 'Засекреченное';
      case 'covert': return 'Тайное';
      case 'contraband': return 'Контрабанда';
      default: return rarity;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden">
      {/* Animated Background - ОПТИМИЗИРОВАНО */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                willChange: 'transform'
              }}
            />
          ))}
        </div>

        {/* Gradient orbs - УПРОЩЕНО */}
        <div
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{ willChange: 'opacity' }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s', willChange: 'opacity' }}
        ></div>
      </div>

      {/* Enhanced Fireworks effect - ЗНАЧИТЕЛЬНО ОПТИМИЗИРОВАНО */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1.5s',
                willChange: 'transform, opacity'
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full animate-bounce"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: '0.8s',
                willChange: 'transform'
              }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-400 animate-spin"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${15 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${12 + Math.random() * 8}px`,
                willChange: 'transform'
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="relative max-w-5xl w-full mx-4">
        {/* Case Opening Stages */}

        {/* Stage 1-2: Case presentation and rolling items */}
        {(animationStage === 'starting' || animationStage === 'rolling' || animationStage === 'stopping') && (
          <div className="space-y-6">
            {/* Case Display - уменьшается при старте анимации */}
            <div className={`text-center transition-all duration-1000 ${
              animationStage === 'starting' ? 'opacity-100 scale-100' : 'opacity-70 scale-75'
            }`}>
              <div className={`mx-auto rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 p-2 shadow-2xl mb-4 ring-4 ring-yellow-400/50 transition-all duration-1000 ${
                animationStage === 'starting' ? 'w-32 h-32' : 'w-20 h-20'
              }`}>
                {caseTemplate?.image_url ? (
                  <img
                    src={caseTemplate.image_url}
                    alt={caseTemplate.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className={`text-yellow-400 transition-all duration-1000 ${
                      animationStage === 'starting' ? 'w-12 h-12' : 'w-8 h-8'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className={`text-white font-bold transition-all duration-1000 ${
                animationStage === 'starting' ? 'text-xl' : 'text-lg'
              }`}>{caseTemplate?.name}</h3>
            </div>

            {/* Rolling Items Container - увеличенный размер для лучшей видимости */}
            <div className="relative h-32 bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
              {/* Центральная фиксированная рамка-прицел */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-20 border-4 border-yellow-400 border-opacity-90 bg-yellow-400/20 z-20 rounded-lg backdrop-blur-sm"
                style={{
                  boxShadow: '0 0 30px rgba(255, 193, 7, 0.8), inset 0 0 20px rgba(255, 193, 7, 0.3)'
                }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                {/* Индикатор фокуса */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>
              </div>

              {/* Rolling items - движущиеся предметы под фиксированной рамкой */}
              <div
                ref={rollingRef}
                className="flex items-center h-full px-4 pt-2"
                style={{
                  transform: `translateX(-${sliderPosition}px)`,
                  transition: animationStage === 'stopping' ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                }}
              >
                {rollingItems.map((item, index) => {
                  const isWinningItem = index === rollingItems.length - 1;
                  const distanceFromCenter = Math.abs((sliderPosition + 40) - (index * 80 + 40));
                  const isInFocus = distanceFromCenter < 60; // предмет в фокусе если близко к центру

                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className={`flex-shrink-0 w-20 h-20 mx-2 rounded-lg p-1 transition-all duration-200 bg-gradient-to-br ${getRarityColor(item.rarity)} ${
                        isWinningItem && animationStage === 'stopping'
                          ? 'ring-4 ring-yellow-400/90 scale-110 shadow-2xl'
                          : isInFocus
                            ? 'scale-105 ring-2 ring-white/50'
                            : 'scale-100 opacity-80'
                      }`}
                      style={{
                        filter: isInFocus ? 'brightness(1.2)' : 'brightness(0.8)'
                      }}
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Показываем цену предмета */}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-1 rounded">
                        {Number(item.price).toFixed(0)}₽
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Градиенты по краям для эффекта исчезновения */}
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black/90 via-black/60 to-transparent z-10"></div>
            </div>

            {/* Status text */}
            <div className="text-center space-y-2">
              <p className="text-purple-200 text-lg font-medium">
                {animationStage === 'starting' && "🎁 Открываем кейс..."}
                {animationStage === 'rolling' && "✨ Предметы кейса в движении"}
                {animationStage === 'stopping' && "🎯 Ваш предмет выбран!"}
              </p>
              {caseItemsData?.success && (
                <p className="text-purple-300 text-sm">
                  Всего предметов в кейсе: {caseItemsData.data.items.length}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stage 3-4: Revealing and showing won item */}
        {(animationStage === 'revealing' || animationStage === 'showing') && wonItem && (
          <div className={`text-center transition-all duration-1000 ${
            animationStage === 'showing' ? 'opacity-100 scale-100' : 'opacity-70 scale-95'
          }`}>
            <div className="space-y-6">
              {/* Won Item Display */}
              <div className={`mx-auto w-64 h-64 rounded-3xl bg-gradient-to-br ${getRarityColor(wonItem.rarity)} p-3 shadow-2xl transition-all duration-1000 ${
                animationStage === 'showing'
                  ? `ring-8 ring-${getRarityColor(wonItem.rarity).split(' ')[1].replace('to-', '')}/50 scale-100`
                  : 'ring-4 ring-gray-500/30 scale-95'
              } ${showFireworks ? 'animate-pulse' : ''}`}>
                {wonItem.image_url ? (
                  <img
                    src={wonItem.image_url}
                    alt={wonItem.name}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-2xl flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {animationStage === 'showing' && (
                <div className="space-y-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
                    <h2 className="text-3xl font-bold text-white mb-3">🎉 Поздравляем!</h2>
                    <h3 className="text-xl font-semibold text-white mb-4">{wonItem.name}</h3>

                    <div className="flex items-center justify-center gap-6 mb-6">
                      <span className={`px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r ${getRarityColor(wonItem.rarity)} text-white shadow-lg`}>
                        {getRarityName(wonItem.rarity)}
                      </span>
                      <span className="text-green-400 font-bold text-2xl bg-black/30 px-4 py-2 rounded-full">
                        {Number(wonItem.price).toFixed(2)} КР
                      </span>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-green-500 via-green-600 to-blue-600 hover:from-green-600 hover:via-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
                    >
                      ✨ Забрать предмет ✨
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-yellow-500 border-b-transparent rounded-full animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-purple-200 text-lg font-medium">Магия в процессе...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseOpeningAnimation;
