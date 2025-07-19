import React, { useState, useEffect, useRef } from 'react';
import type { Item, CaseTemplate } from '../types/api';

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
  const rollingRef = useRef<HTMLDivElement>(null);

  // Создаем массив предметов для анимации прокрутки
  useEffect(() => {
    if (isOpen && caseTemplate?.items) {
      // Создаем список предметов для прокрутки - смешиваем реальные предметы
      const itemPool = [...caseTemplate.items];
      const rollingItemsArray: Item[] = [];

      // Добавляем 20 случайных предметов для прокрутки
      for (let i = 0; i < 20; i++) {
        const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
        rollingItemsArray.push(randomItem);
      }

      setRollingItems(rollingItemsArray);
    }
  }, [isOpen, caseTemplate]);

  useEffect(() => {
    if (isOpen && !isLoading && wonItem) {
      console.log('Starting enhanced case animation with item:', wonItem.name);

      // Фаза 1: Начинаем прокрутку
      setTimeout(() => {
        console.log('Animation stage: rolling');
        setAnimationStage('rolling');
      }, 500);

      // Фаза 2: Замедляем прокрутку и останавливаем на выигранном предмете
      setTimeout(() => {
        console.log('Animation stage: stopping');
        setAnimationStage('stopping');

        // Добавляем выигранный предмет в конец списка для правильной остановки
        setRollingItems(prev => [...prev, wonItem]);
      }, 2500);

      // Фаза 3: Показываем результат
      setTimeout(() => {
        console.log('Animation stage: revealing');
        setAnimationStage('revealing');
      }, 4000);

      // Фаза 4: Финальное отображение с эффектами
      setTimeout(() => {
        console.log('Animation stage: showing');
        setAnimationStage('showing');
        setShowFireworks(true);
      }, 4500);

      setTimeout(() => setShowFireworks(false), 7000);
    }
  }, [isOpen, isLoading, wonItem]);

  useEffect(() => {
    if (isOpen) {
      console.log('Enhanced case opening animation started');
      setAnimationStage('starting');
      setShowFireworks(false);
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
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced Fireworks effect */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
          {[...Array(20)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full animate-bounce"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-400 animate-spin"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${15 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${12 + Math.random() * 8}px`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="relative max-w-4xl w-full mx-4">
        {/* Case Opening Stages */}

        {/* Stage 1-2: Case presentation and rolling items */}
        {(animationStage === 'starting' || animationStage === 'rolling' || animationStage === 'stopping') && (
          <div className="space-y-8">
            {/* Case Display */}
            <div className={`text-center transition-all duration-1000 ${
              animationStage === 'stopping' ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 p-2 shadow-2xl mb-4 ring-4 ring-yellow-400/50">
                {caseTemplate?.image_url ? (
                  <img
                    src={caseTemplate.image_url}
                    alt={caseTemplate.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-white text-xl font-bold">{caseTemplate?.name}</h3>
            </div>

            {/* Rolling Items Container */}
            <div className="relative h-32 bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
              {/* Selection indicator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-400 via-orange-500 to-yellow-400 z-10 shadow-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rotate-45 shadow-lg"></div>
              </div>

              {/* Rolling items */}
              <div
                ref={rollingRef}
                className={`flex items-center h-full transition-transform ${
                  animationStage === 'rolling' ? 'animate-none' : ''
                } ${
                  animationStage === 'stopping' ? 'duration-3000 ease-out' : ''
                }`}
                style={{
                  transform: animationStage === 'rolling'
                    ? 'translateX(-50%)'
                    : animationStage === 'stopping'
                      ? `translateX(-${(rollingItems.length - 1) * 120 - 60}px)` // Stop at won item
                      : 'translateX(0)',
                  animation: animationStage === 'rolling'
                    ? 'roll 2s linear infinite'
                    : 'none'
                }}
              >
                {rollingItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className={`flex-shrink-0 w-24 h-24 mx-2 rounded-lg p-1 transition-all duration-300 ${
                      index === rollingItems.length - 1 && animationStage === 'stopping'
                        ? `bg-gradient-to-br ${getRarityColor(item.rarity)} ring-4 ring-yellow-400/70 scale-110`
                        : `bg-gradient-to-br ${getRarityColor(item.rarity)}`
                    }`}
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
                  </div>
                ))}
              </div>

              {/* Glow effects on sides */}
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black/80 to-transparent z-5"></div>
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black/80 to-transparent z-5"></div>
            </div>

            {/* Status text */}
            <div className="text-center">
              <p className="text-purple-200 text-lg font-medium">
                {animationStage === 'starting' && "Подготовка к открытию..."}
                {animationStage === 'rolling' && "🎰 Выбираем предмет..."}
                {animationStage === 'stopping' && "🎯 Определяем результат..."}
              </p>
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

      {/* CSS Animation for rolling */}
      <style jsx>{`
        @keyframes roll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-240px); }
        }
      `}</style>

        {/* Case Info */}
        {caseTemplate && (
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-bold mb-2">{caseTemplate.name}</h3>
            {animationStage === 'opening' && (
              <p className="text-gray-300">Открываем кейс...</p>
            )}
          </div>
        )}

        {/* Won Item Info */}
        {wonItem && animationStage === 'showing' && (
          <div className={`text-center space-y-4 transition-all duration-1000 ${
            animationStage === 'showing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-2">🎉 Поздравляем!</h2>
              <h3 className="text-lg font-semibold text-white mb-3">{wonItem.name}</h3>

              <div className="flex items-center justify-center gap-4 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getRarityColor(wonItem.rarity)} text-white`}>
                  {getRarityName(wonItem.rarity)}
                </span>
                <span className="text-green-400 font-bold text-xl">
                  {Number(wonItem.price).toFixed(2)} КР
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Забрать предмет
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Выбираем предмет...</p>
          </div>
        )}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
          backgroundSize: '200px 200px'
        }}></div>
      </div>
    </div>
  );
};

export default CaseOpeningAnimation;
