import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
// import { Wheel } from 'react-custom-roulette'; // УБИРАЕМ ЕБАННУЮ БИБЛИОТЕКУ
import {
  useGetUserUpgradeableItemsQuery,
  useGetUpgradeOptionsQuery,
  usePerformUpgradeMutation,
} from '../features/user/userApi';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Monetary from '../components/Monetary';
import { getItemImageUrl } from '../utils/steamImageUtils';
import { soundManager } from '../utils/soundManager';
import { getRarityColor } from '../utils/rarityColors';
import { Search, Zap, Target, Sparkles } from 'lucide-react';
import { CelebrateIcon, SadIcon, ReceivedIcon, CancelIcon } from '../components/icons';

// Создаем SVG заглушку для изображений
const PlaceholderImage: React.FC<{ className?: string }> = ({ className = "w-full h-20" }) => (
  <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center`}>
    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
    </svg>
  </div>
);

// Компонент для отображения выбранных предметов вверху
const SelectedItemsDisplay: React.FC<{
  selectedItems: any[];
  targetItem: any;
  upgradeChance: number;
  totalValue: number;
  onUpgrade: () => void;
  isUpgrading: boolean;
  canUpgrade: boolean;
  showAnimation: boolean;
  upgradeResult: UpgradeResult | null;
  onAnimationComplete: () => void;
  onRemoveSourceItem?: (itemId: string) => void;
  onRemoveTargetItem?: () => void;
}> = ({
  selectedItems,
  targetItem,
  upgradeChance,
  totalValue,
  onUpgrade,
  isUpgrading,
  canUpgrade,
  showAnimation,
  upgradeResult,
  onAnimationComplete,
  onRemoveSourceItem,
  onRemoveTargetItem
}) => {
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});

  const getChanceColor = (chance: number) => {
    if (chance >= 40) return 'text-green-400';
    if (chance >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Скрываем на мобильных и планшетах если не идёт анимация
  if (selectedItems.length === 0 && !targetItem) {
    return (
      <div className="hidden lg:block bg-gradient-to-r from-[#1a1426] to-[#2a1a3a] rounded-xl border border-purple-500/30 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 min-h-[300px] sm:min-h-[400px] md:h-[520px]">
        <div className="text-center h-full flex items-center justify-center">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-2 px-4">Выберите предметы для улучшения</p>
            <p className="text-gray-500 text-xs sm:text-sm px-4">Сначала выберите до 10 предметов снизу, затем целевой предмет</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-[#1a1426] to-[#2a1a3a] rounded-xl border border-purple-500/30 p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 min-h-[400px] sm:min-h-[450px] md:h-[520px] overflow-hidden ${showAnimation ? '' : 'hidden lg:block'}`}>
      {showAnimation && upgradeResult ? (
        <UpgradeAnimationComponent
          upgradeResult={upgradeResult}
          onAnimationComplete={onAnimationComplete}
        />
      ) : (
        // Обычное отображение выбранных предметов
        <div className="h-full flex flex-col">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 text-center flex-shrink-0">Выбранные предметы для улучшения</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 flex-1 min-h-0">
            {/* Исходные предметы */}
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4 flex-shrink-0">
                Ваши предметы ({selectedItems.length}/10)
              </h3>
              <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1 pr-2 max-h-[200px] sm:max-h-[250px] lg:max-h-none">
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="bg-black/50 rounded-lg p-2 sm:p-3 border border-cyan-500/30 transition-all duration-200 hover:bg-black/60 active:scale-95 cursor-pointer group"
                    onClick={() => onRemoveSourceItem && onRemoveSourceItem(item.id)}
                    title="Кликните для удаления"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-black/20 rounded-lg overflow-hidden flex-shrink-0">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20`}></div>
                        {!imageError[item.id] ? (
                          <img
                            src={getItemImageUrl(item.image_url, item.name)}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain z-10"
                            onError={() => setImageError(prev => ({...prev, [item.id]: true}))}
                          />
                        ) : (
                          <PlaceholderImage className="w-full h-full" />
                        )}
                        {/* Иконка удаления */}
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-xs sm:text-sm truncate">{item.name}</div>
                        <div className="text-cyan-300 text-xs">
                          <Monetary value={typeof item.price === 'string' ? parseFloat(item.price) : item.price} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30 flex-shrink-0">
                <div className="text-cyan-300 text-xs sm:text-sm">
                  Общая стоимость: <span className="font-bold"><Monetary value={totalValue} /></span>
                </div>
              </div>
            </div>

            {/* Кнопка улучшения */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center min-h-0 py-4 sm:py-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"/>
                  </svg>
                </div>
                {upgradeChance > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${getChanceColor(upgradeChance)}`}>
                      {upgradeChance}%
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Шанс успеха</div>
                  </div>
                )}
                <button
                  onClick={onUpgrade}
                  disabled={!canUpgrade || isUpgrading}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-2.5 px-6 sm:py-3 sm:px-8 md:py-3.5 md:px-10 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 disabled:cursor-not-allowed active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {isUpgrading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      <span className="text-xs sm:text-sm md:text-base">Улучшение...</span>
                    </div>
                  ) : (
                    'УЛУЧШИТЬ'
                  )}
                </button>
              </div>
            </div>

            {/* Целевой предмет */}
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <h3 className="text-base sm:text-lg font-semibold text-purple-400 mb-3 sm:mb-4 flex-shrink-0">Целевой предмет</h3>
              <div className="overflow-y-auto flex-1 pr-2">
              {targetItem ? (
                <div
                  className="bg-black/50 rounded-lg p-3 sm:p-4 border border-purple-500/30 transition-all duration-200 hover:bg-black/60 active:scale-95 cursor-pointer group"
                  onClick={() => onRemoveTargetItem && onRemoveTargetItem()}
                  title="Кликните для отмены выбора"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-black/20 rounded-lg overflow-hidden flex-shrink-0">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(targetItem.rarity)} opacity-20`}></div>
                      {!imageError[targetItem.id] ? (
                        <img
                          src={getItemImageUrl(targetItem.image_url, targetItem.name)}
                          alt={targetItem.name}
                          className="absolute inset-0 w-full h-full object-contain z-10"
                          onError={() => setImageError(prev => ({...prev, [targetItem.id]: true}))}
                        />
                      ) : (
                        <PlaceholderImage className="w-full h-full" />
                      )}
                      {/* Иконка удаления */}
                      <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm sm:text-base mb-2 truncate">{targetItem.name}</div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Стоимость:</span>
                          <span className="text-purple-300 font-semibold">
                            <Monetary value={typeof targetItem.price === 'string' ? parseFloat(targetItem.price) : targetItem.price} />
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Шанс:</span>
                          <span className={`font-semibold ${getChanceColor(targetItem.upgrade_chance)}`}>
                            {targetItem.upgrade_chance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/50 rounded-lg p-4 border border-gray-600/30 h-24 sm:h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs sm:text-sm">Не выбран</div>
                    <div className="text-gray-500 text-xs">Выберите целевой предмет</div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface UpgradeResult {
  upgrade_success: boolean;
  data: {
    source_items: any[];
    result_item?: any;
    target_item?: any;
    success_chance: number;
    rolled_value: number;
    total_source_price: number;
    cheap_target_bonus: number;
  };
}

// Мобильная анимация улучшения (стрельба по мишени)
const MobileUpgradeAnimation: React.FC<{
  upgradeResult: UpgradeResult;
  onAnimationComplete: () => void;
}> = ({ upgradeResult, onAnimationComplete }) => {
  const [phase, setPhase] = useState<'prepare' | 'aiming' | 'shooting' | 'impact' | 'result'>('prepare');
  const [bulletPosition, setBulletPosition] = useState({ x: 50, y: 50 });
  const [hitPosition, setHitPosition] = useState({ x: 50, y: 50 });
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 50, y: 50 }); // Позиция прицела
  const [impactParticles, setImpactParticles] = useState<Array<{id: number, angle: number, delay: number}>>([]);

  const successChance = upgradeResult.data.success_chance;
  const isSuccess = upgradeResult.upgrade_success;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Анимация движения прицела во время прицеливания
    let crosshairInterval: NodeJS.Timeout | null = null;
    let crosshairMovementTime = 0;
    const crosshairSpeed = 0.02; // Скорость движения прицела

    // Вычисляем точку попадания на статичной мишени
    const targetRadius = 50; // радиус мишени в процентах от центра
    let hitX: number, hitY: number;

    if (isSuccess) {
      // УСПЕХ - попадаем в центральную зону (бычий глаз)
      const successRadius = targetRadius * (successChance / 100);
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomDistance = Math.random() * successRadius * 0.6; // 60% от зоны успеха для визуального эффекта
      hitX = 50 + randomDistance * Math.cos(randomAngle);
      hitY = 50 + randomDistance * Math.sin(randomAngle);
    } else {
      // НЕУДАЧА - попадаем за пределы центральной зоны
      const successRadius = targetRadius * (successChance / 100);
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomDistance = successRadius + Math.random() * (targetRadius - successRadius);
      hitX = 50 + randomDistance * Math.cos(randomAngle);
      hitY = 50 + randomDistance * Math.sin(randomAngle);
    }

    setHitPosition({ x: hitX, y: hitY });

    // Фаза 1: Подготовка (0.8s)
    const timer1 = setTimeout(() => {
      setPhase('aiming');

      // Запускаем хаотичное движение прицела по всей области мишени
      crosshairInterval = setInterval(() => {
        crosshairMovementTime += crosshairSpeed;
        // Прицел двигается хаотично по мишени (комбинация синусоид)
        const offsetX = Math.sin(crosshairMovementTime * Math.PI * 2) * 25 + Math.cos(crosshairMovementTime * Math.PI * 1.5) * 15;
        const offsetY = Math.sin(crosshairMovementTime * Math.PI * 2.3) * 25 + Math.cos(crosshairMovementTime * Math.PI * 1.7) * 15;
        setCrosshairPosition({
          x: 50 + offsetX,
          y: 50 + offsetY
        });
      }, 16); // ~60fps
    }, 800);

    // Фаза 2: Остановка прицела на точке попадания и подготовка к выстрелу (за 0.2s до выстрела)
    const timerStop = setTimeout(() => {
      if (crosshairInterval) {
        clearInterval(crosshairInterval);
        crosshairInterval = null;
      }
      // Фиксируем прицел на точке попадания с плавной анимацией
      setCrosshairPosition({ x: hitX, y: hitY });
      // Устанавливаем начальную позицию пули в точку попадания
      setBulletPosition({ x: hitX, y: hitY });
    }, 2100);

    // Фаза 3: Выстрел (2.3s)
    const timer2 = setTimeout(() => {
      setPhase('shooting');
      soundManager.play('upgrade');

      // Пуля летит из позиции прицела к точке попадания на мишени
      setBulletPosition({ x: hitX, y: hitY });
    }, 2300);

    // Фаза 3: Попадание (0.6s после выстрела)
    const timer3 = setTimeout(() => {
      setPhase('impact');

      // Генерируем частицы попадания
      const particles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        angle: (360 / 16) * i,
        delay: Math.random() * 0.05
      }));
      setImpactParticles(particles);
    }, 2900);

    // Фаза 4: Результат (1.2s после попадания)
    const timer4 = setTimeout(() => {
      setPhase('result');

      if (isSuccess) {
        soundManager.play('win');
      } else {
        soundManager.play('looseUpgrade');
      }
    }, 4100);

    return () => {
      if (crosshairInterval) clearInterval(crosshairInterval);
      clearTimeout(timer1);
      clearTimeout(timerStop);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [upgradeResult, isSuccess, successChance]);

  return (
    <div className="text-center py-6 px-4 min-h-[500px] flex flex-col items-center justify-center">
      {/* Фаза подготовки */}
      {phase === 'prepare' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold text-cyan-300">
            Подготовка к улучшению...
          </h2>
          <div className="text-gray-400">Заряжаем оружие... 🎯</div>
        </div>
      )}

      {/* Фазы прицеливания, выстрела и попадания */}
      {(phase === 'aiming' || phase === 'shooting' || phase === 'impact') && (
        <div className="relative w-full max-w-md mx-auto">
          {/* Заголовок с шансом */}
          <div className="mb-4 text-center">
            <div className={`text-lg font-bold ${
              successChance >= 40 ? 'text-green-400' :
              successChance >= 20 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              Цель: {successChance}% зона
            </div>
            <div className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-2">
              {phase === 'aiming' && (
                <>
                  <Target className="w-4 h-4" />
                  Прицеливаемся...
                </>
              )}
              {phase === 'shooting' && (
                <>
                  <Sparkles className="w-4 h-4" />
                  Огонь!
                </>
              )}
              {phase === 'impact' && (
                <>
                  <Zap className="w-4 h-4" />
                  Попадание!
                </>
              )}
            </div>
          </div>

          {/* Контейнер для статичной мишени */}
          <div className="relative w-64 h-64 mx-auto overflow-visible">
            {/* Мишень (статична в центре) */}
            <div className="absolute w-full h-full">
              {/* Фоновое свечение */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                phase === 'impact'
                  ? isSuccess
                    ? 'bg-gradient-radial from-green-400/30 to-transparent animate-pulse'
                    : 'bg-gradient-radial from-red-400/30 to-transparent animate-pulse'
                  : 'bg-gradient-radial from-purple-500/20 to-transparent'
              }`} />

              {/* Мишень - внешний круг (зона промаха) */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-900/40 to-red-950/60 border-4 border-red-700/50 shadow-2xl">
                {/* Кольца мишени */}
                <div className="absolute inset-[15%] rounded-full border-2 border-red-600/30" />
                <div className="absolute inset-[30%] rounded-full border-2 border-red-500/30" />

                {/* Центральная зона успеха (бычий глаз) */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-green-400/50 to-green-600/60 border-4 border-green-500 shadow-lg shadow-green-500/40"
                  style={{
                    width: `${successChance}%`,
                    height: `${successChance}%`,
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  {/* Внутренний блик */}
                  <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-green-300/40 blur-sm" />
                </div>

                {/* Центральная точка */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg" />
              </div>
            </div>

            {/* Прицел (двигается по мишени во время прицеливания) */}
            {(phase === 'aiming' || phase === 'shooting') && (
              <div
                className="absolute pointer-events-none transition-all z-10"
                style={{
                  left: `${crosshairPosition.x}%`,
                  top: `${crosshairPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transitionDuration: phase === 'aiming' ? '0ms' : '200ms',
                  transitionTimingFunction: 'ease-out'
                }}
              >
                <div className="relative">
                  {/* Перекрестие */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-0.5 bg-cyan-400 shadow-lg shadow-cyan-400/50" style={{ marginTop: '-1px' }} />
                    <div className="w-0.5 h-12 bg-cyan-400 shadow-lg shadow-cyan-400/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  {/* Круг прицела */}
                  <div className={`w-16 h-16 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-400/50 ${phase === 'shooting' ? 'border-4 scale-110' : ''}`} />
                  {/* Точка в центре */}
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 ${phase === 'shooting' ? 'w-2 h-2' : 'w-1 h-1'}`} />

                  {/* Вспышка выстрела */}
                  {phase === 'shooting' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-orange-400/60 animate-ping" />
                  )}
                </div>
              </div>
            )}

            {/* Пуля */}
            {(phase === 'shooting' || phase === 'impact') && (
              <div
                className="absolute w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/80 transition-all z-20"
                style={{
                  left: `${bulletPosition.x}%`,
                  top: `${bulletPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transitionDuration: phase === 'shooting' ? '600ms' : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Трассирующий след */}
                {phase === 'shooting' && (
                  <div className="absolute inset-0 rounded-full bg-yellow-300/60 animate-ping" />
                )}
              </div>
            )}

            {/* Отметка попадания */}
            {phase === 'impact' && (
              <div
                className="absolute z-30"
                style={{
                  left: `${hitPosition.x}%`,
                  top: `${hitPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Вспышка попадания */}
                <div className={`absolute inset-0 w-20 h-20 rounded-full -ml-10 -mt-10 ${
                  isSuccess
                    ? 'bg-gradient-radial from-green-400/80 via-green-500/40 to-transparent'
                    : 'bg-gradient-radial from-orange-400/80 via-red-500/40 to-transparent'
                } animate-ping-fast`} />

                {/* Отверстие от пули */}
                <div className={`relative w-6 h-6 rounded-full border-4 ${
                  isSuccess ? 'border-green-400 bg-green-900/60' : 'border-red-400 bg-red-900/60'
                } shadow-xl`}>
                  <div className="absolute inset-0 rounded-full bg-black/40" />
                </div>

                {/* Частицы разлёта */}
                {impactParticles.map((particle) => (
                  <div
                    key={particle.id}
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                      isSuccess ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    style={{
                      animation: `explode-particle 0.6s ease-out forwards`,
                      animationDelay: `${particle.delay}s`,
                      transform: `rotate(${particle.angle}deg) translateX(0)`,
                      left: '50%',
                      top: '50%',
                      marginLeft: '-3px',
                      marginTop: '-3px',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Фаза результата */}
      {phase === 'result' && (
        <div className="space-y-6 animate-scale-in">
          {/* Иконка результата */}
          <div className="relative">
            {/* Свечение вокруг */}
            <div className={`absolute inset-0 w-32 h-32 mx-auto rounded-full ${
              isSuccess
                ? 'bg-gradient-radial from-green-400/40 to-transparent animate-pulse-slow'
                : 'bg-gradient-radial from-red-400/40 to-transparent animate-pulse-slow'
            }`} />

            {/* Основная иконка */}
            <div className={`relative w-32 h-32 mx-auto rounded-2xl flex items-center justify-center ${
              isSuccess
                ? 'bg-gradient-to-br from-green-500/30 to-green-600/30 border-4 border-green-500 shadow-lg shadow-green-500/50'
                : 'bg-gradient-to-br from-red-500/30 to-red-600/30 border-4 border-red-500 shadow-lg shadow-red-500/50'
            }`}>
              <div className={`text-6xl ${isSuccess ? 'animate-bounce-once' : 'animate-shake'}`}>
                {isSuccess ? '🎯' : '💥'}
              </div>
            </div>
          </div>

          {/* Заголовок */}
          <h2 className={`text-3xl sm:text-4xl font-bold ${
            isSuccess ? 'text-green-400' : 'text-red-400'
          }`}>
            {isSuccess ? 'ТОЧНОЕ ПОПАДАНИЕ!' : 'ПРОМАХ!'}
          </h2>

          {/* Информация о результате */}
          <div className={`max-w-sm mx-auto rounded-xl p-6 border-2 ${
            isSuccess
              ? 'bg-gradient-to-br from-green-950/60 to-green-900/30 border-green-500/50 shadow-xl'
              : 'bg-gradient-to-br from-red-950/60 to-red-900/30 border-red-500/50 shadow-xl'
          }`}>
            <div className="text-xl font-bold mb-3">
              {isSuccess ? 'Улучшение успешно!' : 'Улучшение провалилось'}
            </div>

            {isSuccess && upgradeResult.data.result_item && (
              <div className="mb-3 p-3 bg-black/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Получен предмет:</div>
                <div className="text-lg font-bold text-green-300">
                  {upgradeResult.data.result_item.name}
                </div>
              </div>
            )}

            <div className="text-gray-300 text-sm mb-4 flex items-center justify-center gap-2">
              {isSuccess ? (
                <>
                  <CelebrateIcon className="w-5 h-5" />
                  Вы попали в цель! Предметы улучшены!
                </>
              ) : (
                <>
                  <SadIcon className="w-5 h-5" />
                  Вы промахнулись. Предметы утрачены.
                </>
              )}
            </div>

            <button
              onClick={onAnimationComplete}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 active:scale-95 ${
                isSuccess
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/30'
              }`}
            >
              Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент анимации улучшения (десктоп версия)
const DesktopUpgradeAnimation: React.FC<{
  upgradeResult: UpgradeResult;
  onAnimationComplete: () => void;
}> = ({ upgradeResult, onAnimationComplete }) => {
  const [phase, setPhase] = useState<'preparing' | 'spinning' | 'showing_result'>('preparing');
  const [finalRotation, setFinalRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  React.useEffect(() => {
    // Плавный скролл вверх при начале анимации
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Начинаем анимацию
    const timer1 = setTimeout(() => {
      setPhase('spinning');

      // Воспроизводим звук апгрейда в момент начала вращения
      soundManager.play('upgrade');

      // Вычисляем финальный угол
      const successChance = upgradeResult.data.success_chance;
      const isActualSuccess = upgradeResult.upgrade_success;
      let targetAngle: number;

      if (isActualSuccess) {
        // УСПЕХ - попадаем в зону успеха (зелёная зона от 0 до successChance%)
        const successZoneSize = (successChance / 100) * 360;
        // Случайное место внутри зоны успеха
        targetAngle = Math.random() * successZoneSize;
      } else {
        // НЕУДАЧА - попадаем в зону неудачи (серая зона от successChance% до 100%)
        const failZoneStart = (successChance / 100) * 360;
        const failZoneSize = 360 - failZoneStart;
        // Случайное место внутри зоны неудачи
        targetAngle = failZoneStart + (Math.random() * failZoneSize);
      }

      // Добавляем полные обороты и инвертируем угол (так как рулетка крутится против часовой стрелки)
      const fullRotations = 1440; // 4 полных оборота для большей драматичности
      const finalAngle = fullRotations - targetAngle;

      // Важно: устанавливаем rotation с небольшой задержкой, чтобы браузер успел зарегистрировать начальное состояние
      requestAnimationFrame(() => {
        setTimeout(() => {
          setFinalRotation(finalAngle);
        }, 50);
      });

      // Показываем результат после вращения
      const timer2 = setTimeout(() => {
        setPhase('showing_result');
        setShowResult(true);

        // Воспроизводим звук результата
        if (upgradeResult.upgrade_success) {
          soundManager.play('win');
        } else {
          soundManager.play('looseUpgrade');
        }
      }, 3500); // 3.5 секунды вращения

      return () => clearTimeout(timer2);
    }, 600); // 0.6 секунды подготовки

    return () => clearTimeout(timer1);
  }, [upgradeResult]);

  const getPhaseTitle = () => {
    switch (phase) {
      case 'preparing':
        return 'Подготовка улучшения...';
      case 'spinning':
        return 'Определяем результат...';
      case 'showing_result':
        return upgradeResult.upgrade_success ? 'Успех!' : 'Неудача';
    }
  };

  const successChance = upgradeResult.data.success_chance;
  const isSuccess = upgradeResult.upgrade_success;

  return (
    <div className="text-center py-4 sm:py-6 md:py-8 relative px-2 sm:px-4 upgrade-wheel-animation">
      {/* Фоновое свечение */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {phase === 'preparing' && (
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-radial from-purple-500/20 via-transparent to-transparent rounded-full" />
        )}
        {phase === 'spinning' && (
          <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] bg-gradient-radial from-cyan-500/30 via-purple-500/20 to-transparent rounded-full" />
        )}
        {phase === 'showing_result' && (
          <div className={`w-96 h-96 sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] rounded-full animate-ping-slow ${
            isSuccess ? 'bg-gradient-radial from-emerald-500/30 to-transparent' : 'bg-gradient-radial from-rose-500/30 to-transparent'
          }`} />
        )}
      </div>

      {/* Главная анимация */}
      <div className="relative mt-8 sm:mt-12 md:mt-20 mb-8 sm:mb-12 md:mb-20 flex justify-center z-10">
        <div className="relative w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px] flex items-center justify-center">
          {/* Внешнее кольцо с пульсацией */}
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
            phase === 'preparing' ? 'border-purple-500/40 scale-95 opacity-0' :
            phase === 'spinning' ? 'border-cyan-500/50 scale-100 opacity-100' :
            isSuccess ? 'border-emerald-500/60 scale-105 opacity-100' : 'border-rose-500/60 scale-105 opacity-100'
          }`} />

          {/* Указатель с эффектом свечения */}
          <div className="absolute -top-4 sm:-top-5 md:-top-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="relative">
              <div className={`w-0 h-0 border-l-[8px] sm:border-l-[10px] md:border-l-[12px] border-r-[8px] sm:border-r-[10px] md:border-r-[12px] border-t-[14px] sm:border-t-[17px] md:border-t-[20px] border-l-transparent border-r-transparent transition-all duration-500 ${
                phase === 'preparing' ? 'border-t-purple-400/80' :
                phase === 'spinning' ? 'border-t-cyan-400 drop-shadow-glow-cyan animate-bounce-subtle' :
                isSuccess ? 'border-t-emerald-400 drop-shadow-glow-emerald' : 'border-t-rose-400 drop-shadow-glow-rose'
              }`} />
              {phase === 'spinning' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-cyan-400/30 rounded-full animate-ping" />
              )}
            </div>
          </div>

          {/* Основная рулетка */}
          <div
            className={`w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full relative overflow-hidden ${
              phase === 'preparing' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
            }`}
            style={{
              background: `conic-gradient(
                from 0deg,
                #10b981 0% ${successChance}%,
                #475569 ${successChance}% 100%
              )`,
              transform: phase === 'spinning' || phase === 'showing_result'
                ? `rotate(${finalRotation}deg) translate3d(0, 0, 0)`
                : 'rotate(0deg) translate3d(0, 0, 0)',
              WebkitTransform: phase === 'spinning' || phase === 'showing_result'
                ? `rotate(${finalRotation}deg) translate3d(0, 0, 0)`
                : 'rotate(0deg) translate3d(0, 0, 0)',
              transition: phase === 'spinning'
                ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.35, 0.99), -webkit-transform 3.5s cubic-bezier(0.17, 0.67, 0.35, 0.99)'
                : 'all 0.7s ease-out',
              WebkitTransition: phase === 'spinning'
                ? '-webkit-transform 3.5s cubic-bezier(0.17, 0.67, 0.35, 0.99)'
                : 'all 0.7s ease-out',
              boxShadow: phase === 'spinning'
                ? '0 0 40px rgba(6, 182, 212, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.3)'
                : phase === 'showing_result'
                  ? isSuccess
                    ? '0 0 60px rgba(16, 185, 129, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.3)'
                    : '0 0 60px rgba(244, 63, 94, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.3)'
                  : '0 0 30px rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.3)',
              willChange: phase === 'spinning' ? 'transform' : 'auto',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              perspective: 1000,
              WebkitPerspective: 1000,
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
          >
            {/* Градиентный оверлей */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />

            {/* Деления на рулетке (уменьшено для производительности) */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 w-[1px] h-2 sm:h-2.5 md:h-3 bg-white/20 origin-top"
                style={{
                  transform: `rotate(${i * 15}deg) translateX(-0.5px)`
                }}
              />
            ))}

            {/* Центральный элемент */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <div className={`w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                phase === 'preparing' ? 'bg-slate-900/95 border-purple-500/50' :
                phase === 'spinning' ? 'bg-slate-900/95 border-cyan-500/70 shadow-lg shadow-cyan-500/30' :
                isSuccess ? 'bg-emerald-950/95 border-emerald-500/70 shadow-lg shadow-emerald-500/30' :
                'bg-rose-950/95 border-rose-500/70 shadow-lg shadow-rose-500/30'
              }`}>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl md:text-2xl font-bold transition-all duration-500 ${
                    phase === 'preparing' ? 'text-purple-300' :
                    phase === 'spinning' ? 'text-cyan-300' :
                    isSuccess ? 'text-emerald-300' : 'text-rose-300'
                  }`}>{successChance}%</div>
                  <div className={`text-[10px] sm:text-xs transition-all duration-500 ${
                    phase === 'preparing' ? 'text-purple-400/70' :
                    phase === 'spinning' ? 'text-cyan-400/70' :
                    isSuccess ? 'text-emerald-400/70' : 'text-rose-400/70'
                  }`}>шанс</div>
                </div>
              </div>
            </div>
          </div>

          {/* Результат - показываем только после завершения анимации */}
          {showResult && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className={`animate-scale-in ${
                isSuccess ? 'text-emerald-400 drop-shadow-glow-emerald' : 'text-rose-400 drop-shadow-glow-rose'
              }`}>
                {isSuccess ? (
                  <ReceivedIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" strokeWidth={3} />
                ) : (
                  <CancelIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" strokeWidth={3} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Текст состояния */}
      <div className="mb-4 sm:mb-6 md:mb-8 relative z-10">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 transition-all duration-700 ${
          phase === 'preparing' ? 'text-purple-300 opacity-0 translate-y-4' :
          phase === 'spinning' ? 'text-cyan-300 opacity-100 translate-y-0' :
          isSuccess ? 'text-emerald-400 opacity-100 translate-y-0 drop-shadow-glow-emerald' :
          'text-rose-400 opacity-100 translate-y-0 drop-shadow-glow-rose'
        }`}>
          {getPhaseTitle()}
        </h2>
        <p className={`text-slate-300 text-sm sm:text-base md:text-lg transition-all duration-700 px-4 ${
          phase === 'preparing' ? 'opacity-0' : 'opacity-100'
        }`}>
          {phase === 'showing_result'
            ? (isSuccess
                ? 'Ваш предмет успешно улучшен'
                : 'Попытка улучшения не удалась')
            : 'Пожалуйста, подождите...'
          }
        </p>
      </div>

      {/* Результат - показываем только после завершения анимации */}
      {showResult && (
        <div className={`max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 transition-all duration-1000 relative z-10 ${
          isSuccess
            ? 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border-emerald-500/40 shadow-2xl shadow-emerald-500/20'
            : 'bg-gradient-to-br from-rose-950/40 to-rose-900/20 border-rose-500/40 shadow-2xl shadow-rose-500/20'
        } animate-fade-in-up`}>
          <div className="text-slate-100">
            <div className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              {isSuccess ? 'Улучшение успешно' : 'Улучшение не удалось'}
            </div>
            {isSuccess && upgradeResult.data.result_item && (
              <div className="text-base sm:text-lg mb-2 sm:mb-3 text-slate-200">
                Получен: <span className="font-bold text-emerald-300">{upgradeResult.data.result_item.name}</span>
              </div>
            )}
            <div className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
              {isSuccess
                ? 'Ваши предметы были успешно трансформированы'
                : 'Предметы были утрачены в процессе улучшения'
              }
            </div>

            {/* Кнопка для закрытия анимации */}
            <div className="text-center">
              <button
                onClick={() => onAnimationComplete()}
                className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isSuccess
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50'
                }`}
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Обертка для выбора анимации в зависимости от устройства
const UpgradeAnimationComponent: React.FC<{
  upgradeResult: UpgradeResult;
  onAnimationComplete: () => void;
}> = ({ upgradeResult, onAnimationComplete }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Проверяем размер экрана
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {isMobile ? (
        <MobileUpgradeAnimation
          upgradeResult={upgradeResult}
          onAnimationComplete={onAnimationComplete}
        />
      ) : (
        <DesktopUpgradeAnimation
          upgradeResult={upgradeResult}
          onAnimationComplete={onAnimationComplete}
        />
      )}
    </>
  );
};

// Компонент карточки предмета для выбора
const SourceItemCard: React.FC<{
  itemGroup: any;
  onSelect: (itemId: string) => void;
  selectedItemIds: string[];
  selectedInventoryIds: string[];
  isLimitReached: boolean;
}> = ({ itemGroup, onSelect, selectedItemIds, selectedInventoryIds, isLimitReached }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const { item, count, instances } = itemGroup;

  const isSelected = selectedItemIds.includes(item.id);
  const selectedCount = selectedInventoryIds.filter(id =>
    instances.some((inst: any) => inst.id === id)
  ).length;

  // Проверяем, можно ли взаимодействовать с предметом (добавить или убрать)
  const canInteract = selectedCount > 0 || (selectedCount < count && !isLimitReached);

  return (
    <div
      className={`bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-lg sm:rounded-xl p-2 sm:p-3 border transition-all duration-300 ${
        canInteract
          ? 'cursor-pointer hover:brightness-110 hover:shadow-xl active:scale-95'
          : 'cursor-not-allowed opacity-50'
      } ${
        isSelected
          ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
          : canInteract
            ? 'border-purple-800/30 hover:border-purple-600/50 hover:shadow-purple-500/20'
            : 'border-gray-600/30'
      }`}
      onClick={() => canInteract && onSelect(item.id)}
    >
      <div className="relative">
        {/* Изображение предмета */}
        <div className="relative mb-1.5 sm:mb-2 aspect-square bg-black/10 rounded-lg overflow-hidden" style={{ height: '60px' }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20 rounded-lg`}></div>
          {!imageError ? (
            <img
              src={getItemImageUrl(item.image_url, item.name)}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-contain z-10"
              onError={() => setImageError(true)}
            />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}

          {/* Количество предметов */}
          <div className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold z-20 ${
            !canInteract && selectedCount === 0
              ? 'bg-red-800/80 text-red-200'
              : 'bg-black/80 text-white'
          }`}>
            {selectedCount > 0 ? `${selectedCount}/${count}` : `x${count}`}
          </div>

          {/* Индикатор блокировки (только если нельзя взаимодействовать и ничего не выбрано) */}
          {!canInteract && selectedCount === 0 && (
            <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-1 sm:px-1.5 py-0.5 rounded bg-red-800/80 text-red-200 text-[10px] sm:text-xs font-bold z-20">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Индикатор возможности удаления */}
          {selectedCount > 0 && (
            <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-1 sm:px-1.5 py-0.5 rounded bg-cyan-800/80 text-cyan-200 text-[10px] sm:text-xs font-bold z-20" title="Кликните для удаления">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Индикатор выбора */}
          {selectedCount > 0 && (
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg z-15 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-[10px] sm:text-xs font-bold">{selectedCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-white font-semibold text-[10px] sm:text-xs leading-tight truncate" title={item.name}>
            {item.name}
          </h3>

          {item.weapon_type && (
            <p className="text-gray-400 text-[9px] sm:text-xs truncate">
              {item.weapon_type}
            </p>
          )}

          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className="text-cyan-300 truncate">{t('upgrade.item_value')}</span>
            <span className="text-cyan-300 font-semibold ml-1">
              <Monetary value={typeof item.price === 'string' ? parseFloat(item.price) : item.price} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки целевого предмета
const TargetItemCard: React.FC<{
  item: any;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ item, onSelect, isSelected }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const getChanceColor = (chance: number) => {
    if (chance >= 40) return 'text-green-400';
    if (chance >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#1a1426]/95 to-[#0f0a1b]/95 rounded-lg sm:rounded-xl p-2 sm:p-3 border transition-all duration-300 cursor-pointer hover:brightness-110 hover:shadow-xl active:scale-95 ${
        isSelected
          ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
          : 'border-purple-800/30 hover:border-purple-600/50 hover:shadow-purple-500/20'
      }`}
      onClick={onSelect}
    >
      <div className="relative">
        {/* Изображение предмета */}
        <div className="relative mb-1.5 sm:mb-2 aspect-square bg-black/10 rounded-lg overflow-hidden" style={{ height: '60px' }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20 rounded-lg`}></div>
          {!imageError ? (
            <img
              src={getItemImageUrl(item.image_url, item.name)}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-contain z-10"
              onError={() => setImageError(true)}
            />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}

          {/* Шанс успеха */}
          <div className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-1 sm:px-1.5 py-0.5 rounded bg-black/80 ${getChanceColor(item.upgrade_chance)} text-[10px] sm:text-xs font-bold z-20 shadow-lg`}>
            {item.upgrade_chance}%
          </div>

          {/* Индикатор выбора с возможностью отмены */}
          {isSelected && (
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg z-15 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg" title="Кликните для отмены выбора">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-white font-semibold text-[10px] sm:text-xs leading-tight truncate" title={item.name}>
            {item.name}
          </h3>

          {item.weapon_type && (
            <p className="text-gray-400 text-[9px] sm:text-xs truncate">
              {item.weapon_type}
            </p>
          )}

          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="text-cyan-300 truncate">{t('upgrade.target_value')}</span>
              <span className="text-cyan-300 font-semibold ml-1">
                <Monetary value={typeof item.price === 'string' ? parseFloat(item.price) : item.price} />
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="text-purple-300 truncate">{t('upgrade.success_chance')}</span>
              <span className={`font-semibold ml-1 ${getChanceColor(item.upgrade_chance)}`}>
                {item.upgrade_chance}%
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="text-gray-400 truncate">{t('upgrade.price_ratio')}</span>
              <span className="text-gray-400 ml-1">
                x{item.price_ratio}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpgradePage: React.FC = () => {
  const { t } = useTranslation();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [selectedTargetItem, setSelectedTargetItem] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<UpgradeResult | null>(null);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // API queries
  const {
    data: upgradeableItems,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems
  } = useGetUserUpgradeableItemsQuery();

  // ИСПРАВЛЕНО: Теперь передаем selectedInventoryIds вместо selectedItemIds
  const {
    data: upgradeOptions,
    isLoading: isLoadingOptions,
  } = useGetUpgradeOptionsQuery(selectedInventoryIds, {
    skip: selectedInventoryIds.length === 0 || showAnimation || isProcessingUpgrade
  });

  const [performUpgrade, { isLoading: isUpgrading }] = usePerformUpgradeMutation();

  // Очистка таймера при unmount
  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Автоматическая очистка недоступных предметов из выбора
  React.useEffect(() => {
    // Не выполняем очистку во время анимации или процесса апгрейда
    if (showAnimation || isUpgrading || isProcessingUpgrade) {
      return;
    }

    if (upgradeableItems?.data?.items && selectedInventoryIds.length > 0) {
      // Получаем список всех доступных ID предметов в инвентаре
      const availableInventoryIds = new Set<string>();
      upgradeableItems.data.items.forEach(itemGroup => {
        itemGroup.instances.forEach((inst: any) => {
          if (inst && inst.id) {
            availableInventoryIds.add(inst.id);
          }
        });
      });

      // Фильтруем выбранные предметы, оставляя только доступные
      const validSelectedInventoryIds = selectedInventoryIds.filter(id =>
        availableInventoryIds.has(id)
      );

      // Если есть недоступные предметы, обновляем состояние
      if (validSelectedInventoryIds.length !== selectedInventoryIds.length) {
        setSelectedInventoryIds(validSelectedInventoryIds);

        // Также обновляем selectedItemIds
        const validItemIds = new Set<string>();
        upgradeableItems.data.items.forEach(itemGroup => {
          const hasSelectedInstance = itemGroup.instances.some((inst: any) =>
            inst && inst.id && validSelectedInventoryIds.includes(inst.id)
          );
          if (hasSelectedInstance) {
            validItemIds.add(itemGroup.item.id);
          }
        });

        setSelectedItemIds(Array.from(validItemIds));

        // Сбрасываем целевой предмет
        setSelectedTargetItem('');

        console.log('Очищены недоступные предметы из выбора');
      }
    }
  }, [upgradeableItems, selectedInventoryIds, selectedItemIds, showAnimation, isUpgrading, isProcessingUpgrade]);

  // Фильтрация предметов (убираем ограничение по минимальной цене)
  const filteredItems = React.useMemo(() => {
    if (!upgradeableItems?.data?.items) return [];

    return upgradeableItems.data.items.filter(itemGroup =>
      itemGroup.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      // Убрали: && itemGroup.item.price >= 10 - теперь можно улучшать любые предметы
    );
  }, [upgradeableItems, searchTerm]);

  // Получаем выбранные предметы для отображения
  const selectedItemsDetails = React.useMemo(() => {
    if (!upgradeableItems?.data?.items || selectedInventoryIds.length === 0) return [];

    const details: any[] = [];
    upgradeableItems.data.items.forEach(itemGroup => {
      itemGroup.instances.forEach((inst: any) => {
        if (selectedInventoryIds.includes(inst.id)) {
          details.push(itemGroup.item);
        }
      });
    });

    return details;
  }, [upgradeableItems, selectedInventoryIds]);

  // Получаем выбранный целевой предмет
  const selectedTargetItemDetails = React.useMemo(() => {
    if (!selectedTargetItem || !upgradeOptions?.data?.upgrade_options) return null;
    return upgradeOptions.data.upgrade_options.find(item => item.id === selectedTargetItem) || null;
  }, [selectedTargetItem, upgradeOptions]);

  // Получаем шанс улучшения из выбранного целевого предмета
  const upgradeChance = React.useMemo(() => {
    return selectedTargetItemDetails?.upgrade_chance || 0;
  }, [selectedTargetItemDetails]);

  // Обработчик выбора исходных предметов
  const handleSelectSourceItem = useCallback((itemId: string) => {
    const itemGroup = filteredItems.find(group => group.item.id === itemId);
    if (!itemGroup) {
      console.warn('Предмет не найден:', itemId);
      return;
    }

    // Проверяем, что экземпляры предмета существуют
    if (!itemGroup.instances || itemGroup.instances.length === 0) {
      console.warn('У предмета нет доступных экземпляров:', itemId);
      return;
    }

    // Находим выбранные экземпляры этого предмета
    const selectedInstances = itemGroup.instances.filter((inst: any) =>
      inst && inst.id && selectedInventoryIds.includes(inst.id)
    );

    // Находим доступные экземпляры этого предмета, которые еще не выбраны
    const availableInstances = itemGroup.instances.filter((inst: any) =>
      inst && inst.id && !selectedInventoryIds.includes(inst.id)
    );

    if (selectedInstances.length > 0) {
      // Если есть выбранные экземпляры - убираем один
      const instanceToRemove = selectedInstances[0].id;
      setSelectedInventoryIds(prev => prev.filter(id => id !== instanceToRemove));

      // Проверяем, остались ли еще выбранные экземпляры этого предмета
      const remainingSelectedInstances = selectedInstances.slice(1);
      if (remainingSelectedInstances.length === 0) {
        setSelectedItemIds(prev => prev.filter(id => id !== itemId));
      }
    } else if (availableInstances.length > 0) {
      // Если нет выбранных экземпляров, но есть доступные - добавляем один

      // Проверяем ограничение на 10 предметов
      if (selectedInventoryIds.length >= 10) {
        toast.error('Можно выбрать максимум 10 предметов за одну попытку улучшения');
        return;
      }

      // Добавляем один экземпляр
      const newInventoryId = availableInstances[0].id;
      setSelectedInventoryIds(prev => [...prev, newInventoryId]);

      // Добавляем ID предмета, если его еще нет
      if (!selectedItemIds.includes(itemId)) {
        setSelectedItemIds(prev => [...prev, itemId]);
      }
    }

    // Сбрасываем выбранный целевой предмет при изменении исходных предметов
    setSelectedTargetItem('');
  }, [filteredItems, selectedInventoryIds, selectedItemIds]);

  // Обработчик сброса выбора
  const handleClearSelection = useCallback(() => {
    setSelectedItemIds([]);
    setSelectedInventoryIds([]);
    setSelectedTargetItem('');
  }, []);

  // Обработчик выбора целевого предмета
  const handleSelectTargetItem = useCallback((itemId: string) => {
    // Если предмет уже выбран, убираем выбор
    if (selectedTargetItem === itemId) {
      setSelectedTargetItem('');
    } else {
      setSelectedTargetItem(itemId);
    }
  }, [selectedTargetItem]);

  // Подсчет общей стоимости выбранных предметов
  const totalSelectedPrice = React.useMemo(() => {
    if (!upgradeableItems?.data?.items || selectedInventoryIds.length === 0) return 0;

    let total = 0;
    upgradeableItems.data.items.forEach(itemGroup => {
      itemGroup.instances.forEach((inst: any) => {
        if (selectedInventoryIds.includes(inst.id)) {
          // Преобразуем цену в число и проверяем что это корректное число
          const price = typeof itemGroup.item.price === 'string'
            ? parseFloat(itemGroup.item.price)
            : itemGroup.item.price;
          if (!isNaN(price) && isFinite(price)) {
            total += price;
          }
        }
      });
    });

    return total;
  }, [upgradeableItems, selectedInventoryIds]);

  // Обработчик выполнения апгрейда
  const handlePerformUpgrade = async () => {
    try {
      if (selectedInventoryIds.length === 0 || !selectedTargetItem) {
        toast.error('Выберите предметы для улучшения и целевой предмет');
        return;
      }

      if (selectedInventoryIds.length > 10) {
        toast.error('Максимальное количество предметов для улучшения - 10');
        return;
      }

      // Устанавливаем флаг обработки перед началом запроса
      setIsProcessingUpgrade(true);

      const result = await performUpgrade({
        sourceInventoryIds: selectedInventoryIds,
        targetItemId: selectedTargetItem
      }).unwrap();

      const adaptedResult: UpgradeResult = {
        upgrade_success: result.upgrade_success,
        data: {
          source_items: result.data.source_items,
          result_item: result.data.result_item,
          target_item: result.data.target_item,
          success_chance: result.data.success_chance,
          rolled_value: result.data.rolled_value,
          total_source_price: result.data.total_source_price,
          cheap_target_bonus: result.data.cheap_target_bonus
        }
      };
      setUpgradeResult(adaptedResult);
      setShowAnimation(true);

      // Звуки теперь воспроизводятся в компоненте анимации

      // Очищаем предыдущий таймер, если есть
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Автоматически скрываем анимацию через 7.5 секунд
      // (500ms подготовка + 3000ms вращение + 4000ms показ результата)
      animationTimeoutRef.current = setTimeout(() => {
        handleAnimationComplete();
      }, 7500);

    } catch (error: any) {
      console.error('Ошибка при апгрейде:', error);
      const errorMessage = error?.data?.message || error?.message || t('errors.server_error');
      toast.error(errorMessage);
      // Сбрасываем флаг обработки в случае ошибки
      setIsProcessingUpgrade(false);
    }
  };

  // Обработчик завершения анимации
  const handleAnimationComplete = () => {
    // Очищаем таймер, если анимация закрыта вручную
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    setShowAnimation(false);
    setIsProcessingUpgrade(false);

    if (upgradeResult) {
      if (upgradeResult.upgrade_success) {
        toast.success(
          <div>
            <div className="font-semibold">{t('upgrade.success')}!</div>
            <div className="text-sm">{t('upgrade.received_item', { item: upgradeResult.data.result_item?.name })}</div>
          </div>
        );
      } else {
        toast.error(
          <div>
            <div className="font-semibold">{t('upgrade.failed')}</div>
            <div className="text-sm">Предметы потеряны</div>
          </div>
        );
      }

      // ИСПРАВЛЕНО: Сначала очищаем выбор, ПОТОМ обновляем данные
      // Это предотвращает попытку запроса опций для уже удаленных предметов
      setSelectedItemIds([]);
      setSelectedInventoryIds([]);
      setSelectedTargetItem('');
      setUpgradeResult(null);

      // Небольшая задержка перед обновлением, чтобы состояние успело обновиться
      setTimeout(() => {
        refetchItems();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <ScrollToTopOnMount />

      {/* Фиксированный фон на весь экран */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          backgroundImage: 'url(/images/upgrade.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Затемняющий оверлей */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 -z-40"></div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Заголовок */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t('upgrade.title')}</h1>
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">{t('upgrade.subtitle')}</p>
        </div>

        {/* НОВОЕ: Предупреждения и информация */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          {/* Предупреждение о минимальной стоимости */}
          {totalSelectedPrice > 0 && totalSelectedPrice < 5 && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-red-300 font-semibold text-sm sm:text-base mb-1">Слишком низкая стоимость</h3>
                  <p className="text-red-200 text-xs sm:text-sm">
                    Минимальная общая стоимость для улучшения - 5 chiCoins. Текущая: <span className="font-bold">{totalSelectedPrice.toFixed(2)} chiCoins</span>.
                    Выберите более дорогие предметы или добавьте еще.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Компонент отображения выбранных предметов */}
        <SelectedItemsDisplay
          selectedItems={selectedItemsDetails}
          targetItem={selectedTargetItemDetails}
          upgradeChance={upgradeChance}
          totalValue={totalSelectedPrice}
          onUpgrade={handlePerformUpgrade}
          isUpgrading={isUpgrading}
          canUpgrade={selectedInventoryIds.length > 0 && selectedTargetItem !== ''}
          showAnimation={showAnimation}
          upgradeResult={upgradeResult}
          onAnimationComplete={handleAnimationComplete}
          onRemoveSourceItem={handleSelectSourceItem}
          onRemoveTargetItem={() => setSelectedTargetItem('')}
        />

        {/* Панель управления */}
        <div className="bg-gradient-to-r from-[#1a1426] to-[#2a1a3a] rounded-xl border border-purple-500/30 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">

          {/* Поиск и кнопки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('upgrade.search_placeholder')}
                className="w-full bg-black/60 border border-gray-600 rounded-lg pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleClearSelection}
              disabled={selectedInventoryIds.length === 0}
              className="bg-red-600 hover:bg-red-700 active:scale-95 disabled:bg-gray-600 text-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all disabled:cursor-not-allowed shadow-lg"
            >
              Сбросить выбор ({selectedInventoryIds.length})
            </button>
          </div>

          {/* Кнопка улучшения для мобильных устройств */}
          <div className="lg:hidden mt-4">
            {selectedInventoryIds.length > 0 && selectedTargetItem && (
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-cyan-300 text-sm">Выбрано предметов: {selectedInventoryIds.length}/10</div>
                    <div className="text-purple-300 text-sm">Общая стоимость: <Monetary value={totalSelectedPrice} /></div>
                  </div>
                  {upgradeChance > 0 && (
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${upgradeChance >= 40 ? 'text-green-400' : upgradeChance >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {upgradeChance}%
                      </div>
                      <div className="text-gray-400 text-xs">Шанс</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePerformUpgrade}
                  disabled={selectedInventoryIds.length === 0 || !selectedTargetItem || isUpgrading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-6 rounded-lg font-semibold text-base transition-all duration-200 disabled:cursor-not-allowed active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {isUpgrading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Улучшение...</span>
                    </div>
                  ) : (
                    'УЛУЧШИТЬ'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Выбор исходных предметов */}
          <div className="bg-[#1a1426] rounded-xl p-3 sm:p-4 md:p-6 border border-purple-800/30">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                {t('upgrade.step_1_title')} ({selectedInventoryIds.length}/10)
              </h2>
              {selectedInventoryIds.length >= 10 && (
                <div className="text-yellow-400 text-xs sm:text-sm flex items-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Достигнут лимит предметов (10/10)
                </div>
              )}
            </div>

            {isLoadingItems ? (
              <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-cyan-500"></div>
                <span className="ml-2 sm:ml-3 text-gray-400 text-sm sm:text-base">{t('upgrade.loading_items')}</span>
              </div>
            ) : itemsError ? (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <p className="text-red-400 text-sm sm:text-base mb-3 sm:mb-4">{t('upgrade.error_loading_items')}</p>
                <button
                  onClick={() => refetchItems()}
                  className="bg-purple-600 hover:bg-purple-700 active:scale-95 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-all shadow-lg"
                >
                  {t('upgrade.try_again')}
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-2">{t('upgrade.no_items_available')}</p>
                <p className="text-gray-500 text-xs sm:text-sm">{t('upgrade.open_cases_to_upgrade')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 max-h-72 sm:max-h-80 md:max-h-96 overflow-y-auto">
                {filteredItems.map((itemGroup) => (
                  <SourceItemCard
                    key={itemGroup.item.id}
                    itemGroup={itemGroup}
                    onSelect={handleSelectSourceItem}
                    selectedItemIds={selectedItemIds}
                    selectedInventoryIds={selectedInventoryIds}
                    isLimitReached={selectedInventoryIds.length >= 10}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Выбор целевого предмета */}
          <div className="bg-[#1a1426] rounded-xl p-3 sm:p-4 md:p-6 border border-purple-800/30">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-4 sm:mb-6">
              {t('upgrade.step_2_title')}
            </h2>

            {selectedItemIds.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm sm:text-base px-4">Сначала выберите предметы для улучшения</p>
              </div>
            ) : isLoadingOptions ? (
              <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
                <span className="ml-2 sm:ml-3 text-gray-400 text-sm sm:text-base">{t('upgrade.loading_options')}</span>
              </div>
            ) : upgradeOptions?.data?.upgrade_options.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <p className="text-gray-400 text-sm sm:text-base px-4">{t('upgrade.no_upgrade_options')}</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 px-4">Попробуйте выбрать другие предметы или увеличьте их количество</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 max-h-72 sm:max-h-80 md:max-h-96 overflow-y-auto">
                  {upgradeOptions?.data?.upgrade_options.map((item) => (
                    <TargetItemCard
                      key={item.id}
                      item={item}
                      onSelect={() => handleSelectTargetItem(item.id)}
                      isSelected={selectedTargetItem === item.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
