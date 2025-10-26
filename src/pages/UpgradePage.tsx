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

  const getChanceColor = (chance: number) => {
    if (chance >= 40) return 'text-green-400';
    if (chance >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (selectedItems.length === 0 && !targetItem) {
    return (
      <div className="bg-gradient-to-r from-[#1a1426]/80 to-[#2a1a3a]/80 backdrop-blur-md rounded-xl border border-purple-500/30 p-8 mb-8 h-[520px]">
        <div className="text-center h-full flex items-center justify-center">
          <div>
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">Выберите предметы для улучшения</p>
            <p className="text-gray-500 text-sm">Сначала выберите до 10 предметов снизу, затем целевой предмет</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#1a1426]/80 to-[#2a1a3a]/80 backdrop-blur-md rounded-xl border border-purple-500/30 p-6 mb-8 h-[520px] overflow-hidden">
      {showAnimation && upgradeResult ? (
        <UpgradeAnimationComponent
          upgradeResult={upgradeResult}
          onAnimationComplete={onAnimationComplete}
        />
      ) : (
        // Обычное отображение выбранных предметов
        <div className="h-full flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 text-center flex-shrink-0">Выбранные предметы для улучшения</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Исходные предметы */}
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex-shrink-0">
                Ваши предметы ({selectedItems.length}/10)
              </h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30 transition-all duration-200 hover:bg-black/40 cursor-pointer group"
                    onClick={() => onRemoveSourceItem && onRemoveSourceItem(item.id)}
                    title="Кликните для удаления"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-16 h-16 bg-black/20 rounded-lg overflow-hidden">
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
                        <div className="absolute top-1 right-1 w-5 h-5 bg-red-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm truncate">{item.name}</div>
                        <div className="text-cyan-300 text-xs">
                          <Monetary value={typeof item.price === 'string' ? parseFloat(item.price) : item.price} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-cyan-500/10 backdrop-blur-sm rounded-lg border border-cyan-500/30 flex-shrink-0">
                <div className="text-cyan-300 text-sm">
                  Общая стоимость: <span className="font-bold"><Monetary value={totalValue} /></span>
                </div>
              </div>
            </div>

            {/* Кнопка улучшения */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center min-h-0">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"/>
                  </svg>
                </div>
                {upgradeChance > 0 && (
                  <div className="mb-4">
                    <div className={`text-2xl font-bold ${getChanceColor(upgradeChance)}`}>
                      {upgradeChance}%
                    </div>
                    <div className="text-gray-400 text-sm">Шанс успеха</div>
                  </div>
                )}
                <button
                  onClick={onUpgrade}
                  disabled={!canUpgrade || isUpgrading}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-8 rounded-lg font-semibold text-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isUpgrading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Улучшение...
                    </div>
                  ) : (
                    'УЛУЧШИТЬ'
                  )}
                </button>
              </div>
            </div>

            {/* Целевой предмет */}
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex-shrink-0">Целевой предмет</h3>
              <div className="overflow-y-auto flex-1 pr-2">
              {targetItem ? (
                <div
                  className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 transition-all duration-200 hover:bg-black/40 cursor-pointer group"
                  onClick={() => onRemoveTargetItem && onRemoveTargetItem()}
                  title="Кликните для отмены выбора"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 bg-black/20 rounded-lg overflow-hidden">
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
                      <div className="absolute top-1 right-1 w-6 h-6 bg-red-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-2">{targetItem.name}</div>
                      <div className="space-y-1 text-sm">
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
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">Не выбран</div>
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

// Компонент анимации улучшения
const UpgradeAnimationComponent: React.FC<{
  upgradeResult: UpgradeResult;
  onAnimationComplete: () => void;
}> = ({ upgradeResult, onAnimationComplete }) => {
  const [phase, setPhase] = useState<'preparing' | 'spinning' | 'showing_result'>('preparing');
  const [finalRotation, setFinalRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    // Плавный скролл вверх при начале анимации
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Начинаем анимацию
    const timer1 = setTimeout(() => {
      setPhase('spinning');
      // Увеличиваем рулетку во время вращения
      setScale(1.5);

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
      const fullRotations = 1080; // 3 полных оборота
      // Инвертируем угол, чтобы указатель корректно указывал на нужную зону
      setFinalRotation(fullRotations - targetAngle);

      // Показываем результат после вращения
      const timer2 = setTimeout(() => {
        setPhase('showing_result');
        setShowResult(true);
        // Возвращаем рулетку к нормальному размеру
        setScale(1);
      }, 3000); // 3 секунды вращения

      return () => clearTimeout(timer2);
    }, 500); // 0.5 секунды подготовки

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

  return (
    <div className="text-center py-8">
      {/* Главная анимация */}
      <div className="relative mt-16 mb-16 flex justify-center">
        <div className="relative">
          {/* Указатель */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30">
            <div className="w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-slate-300 drop-shadow-lg"></div>
          </div>

          {/* Основная рулетка */}
          <div
            className="w-60 h-60 rounded-full border-4 border-slate-600/50 relative overflow-hidden shadow-2xl backdrop-blur-sm"
            style={{
              background: `conic-gradient(
                #059669 0% ${upgradeResult.data.success_chance}%,
                #64748b ${upgradeResult.data.success_chance}% 100%
              )`,
              transform: phase === 'spinning' || phase === 'showing_result'
                ? `rotate(${finalRotation}deg) scale(${scale})`
                : `rotate(0deg) scale(${scale})`,
              transition: phase === 'spinning'
                ? 'transform 3s cubic-bezier(0.05, 0.5, 0.3, 0.95)'
                : 'transform 0.5s ease-out'
            }}
          >
            {/* Центральный элемент */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20">
              <div className="w-full h-full rounded-full flex items-center justify-center bg-slate-800/90 border border-slate-500">
                <div className="text-slate-200 font-medium text-center">
                  <div className="text-lg">{upgradeResult.data.success_chance}%</div>
                  <div className="text-xs text-slate-400">шанс</div>
                </div>
              </div>
            </div>
          </div>

          {/* Результат - показываем только после завершения анимации */}
          {showResult && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className={`text-4xl font-light animate-bounce ${
                upgradeResult.upgrade_success ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {upgradeResult.upgrade_success ? '✓' : '✕'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Текст состояния */}
      <div className="mb-6">
        <h2 className={`text-3xl font-light mb-3 transition-all duration-700 ${
          phase === 'showing_result'
            ? (upgradeResult.upgrade_success ? 'text-emerald-400' : 'text-rose-400')
            : 'text-slate-200'
        }`}>
          {getPhaseTitle()}
        </h2>
        <p className="text-slate-400 text-lg font-light">
          {phase === 'showing_result'
            ? (upgradeResult.upgrade_success
                ? 'Ваш предмет успешно улучшен'
                : 'Попытка улучшения не удалась')
            : 'Пожалуйста, подождите...'
          }
        </p>
      </div>

      {/* Результат - показываем только после завершения анимации */}
      {showResult && (
        <div className={`rounded-xl p-6 border backdrop-blur-md transition-all duration-1000 ${
          upgradeResult.upgrade_success
            ? 'bg-emerald-900/20 border-emerald-500/30'
            : 'bg-rose-900/20 border-rose-500/30'
        }`}>
          <div className="text-slate-200">
            <div className="text-xl font-light mb-3">
              {upgradeResult.upgrade_success ? 'Улучшение успешно' : 'Улучшение не удалось'}
            </div>
            {upgradeResult.upgrade_success && upgradeResult.data.result_item && (
              <div className="text-lg mb-2 text-slate-300">
                Получен: <span className="font-medium text-emerald-400">{upgradeResult.data.result_item.name}</span>
              </div>
            )}
            <div className="text-slate-400 font-light mb-4">
              {upgradeResult.upgrade_success
                ? 'Ваши предметы были успешно трансформированы'
                : 'Предметы были утрачены в процессе улучшения'
              }
            </div>

            {/* Кнопка для закрытия анимации */}
            <div className="text-center">
              <button
                onClick={() => onAnimationComplete()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  upgradeResult.upgrade_success
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
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

  return (
    <div
      className={`bg-gradient-to-br from-[#1a1426]/90 to-[#0f0a1b]/90 backdrop-blur-sm rounded-xl p-3 border transition-all duration-300 ${
        canInteract
          ? 'cursor-pointer hover:brightness-110 hover:shadow-xl'
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
        <div className="relative mb-2 aspect-square bg-black/10 rounded-lg overflow-hidden" style={{ height: '80px' }}>
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
          <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold z-20 ${
            !canInteract && selectedCount === 0
              ? 'bg-red-800/80 text-red-200'
              : 'bg-black/80 text-white'
          }`}>
            {selectedCount > 0 ? `${selectedCount}/${count}` : `x${count}`}
          </div>

          {/* Индикатор блокировки (только если нельзя взаимодействовать и ничего не выбрано) */}
          {!canInteract && selectedCount === 0 && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-red-800/80 text-red-200 text-xs font-bold z-20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Индикатор возможности удаления */}
          {selectedCount > 0 && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-cyan-800/80 text-cyan-200 text-xs font-bold z-20" title="Кликните для удаления">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Индикатор выбора */}
          {selectedCount > 0 && (
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg z-15 flex items-center justify-center">
              <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{selectedCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-white font-semibold text-xs truncate" title={item.name}>
            {item.name}
          </h3>

          {item.weapon_type && (
            <p className="text-gray-400 text-xs">
              {item.weapon_type}
            </p>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-cyan-300">{t('upgrade.item_value')}</span>
            <span className="text-cyan-300 font-semibold">
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

  const getChanceColor = (chance: number) => {
    if (chance >= 40) return 'text-green-400';
    if (chance >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#1a1426]/90 to-[#0f0a1b]/90 backdrop-blur-sm rounded-xl p-3 border transition-all duration-300 cursor-pointer hover:brightness-110 hover:shadow-xl ${
        isSelected
          ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
          : 'border-purple-800/30 hover:border-purple-600/50 hover:shadow-purple-500/20'
      }`}
      onClick={onSelect}
    >
      <div className="relative">
        {/* Изображение предмета */}
        <div className="relative mb-2 aspect-square bg-black/10 rounded-lg overflow-hidden" style={{ height: '80px' }}>
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
          <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 ${getChanceColor(item.upgrade_chance)} text-xs font-bold z-20`}>
            {item.upgrade_chance}%
          </div>

          {/* Убираем отображение бонуса за количество */}

          {/* Индикатор выбора с возможностью отмены */}
          {isSelected && (
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg z-15 flex items-center justify-center">
              <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center" title="Кликните для отмены выбора">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-white font-semibold text-xs truncate" title={item.name}>
            {item.name}
          </h3>

          {item.weapon_type && (
            <p className="text-gray-400 text-xs">
              {item.weapon_type}
            </p>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-300">{t('upgrade.target_value')}</span>
              <span className="text-cyan-300 font-semibold">
                <Monetary value={typeof item.price === 'string' ? parseFloat(item.price) : item.price} />
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-purple-300">{t('upgrade.success_chance')}</span>
              <span className={`font-semibold ${getChanceColor(item.upgrade_chance)}`}>
                {item.upgrade_chance}%
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{t('upgrade.price_ratio')}</span>
              <span className="text-gray-400">
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

  const {
    data: upgradeOptions,
    isLoading: isLoadingOptions,
  } = useGetUpgradeOptionsQuery(selectedItemIds, {
    skip: selectedItemIds.length === 0
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

      // Сбрасываем выбор и обновляем данные после завершения анимации
      setSelectedItemIds([]);
      setSelectedInventoryIds([]);
      setSelectedTargetItem('');
      setUpgradeResult(null);
      refetchItems();
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <ScrollToTopOnMount />

      {/* Фиксированный фон на весь экран */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          backgroundImage: 'url(https://s.iimg.su/s/25/uR0XDDXx5zfcmyKF9K872YIjR6O2hf8Zuwf7eiy1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Затемняющий оверлей */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 -z-40"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">{t('upgrade.title')}</h1>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <p className="text-gray-400 text-lg">{t('upgrade.subtitle')}</p>
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
        <div className="bg-gradient-to-r from-[#1a1426]/80 to-[#2a1a3a]/80 backdrop-blur-md rounded-xl border border-purple-500/30 p-6 mb-8">

          {/* Поиск и кнопки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('upgrade.search_placeholder')}
              className="bg-black/50 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
            />

            <button
              onClick={handleClearSelection}
              disabled={selectedInventoryIds.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Сбросить выбор ({selectedInventoryIds.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Выбор исходных предметов */}
          <div className="bg-[#1a1426]/80 backdrop-blur-md rounded-xl p-6 border border-purple-800/30">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                {t('upgrade.step_1_title')} ({selectedInventoryIds.length}/10)
              </h2>
              {selectedInventoryIds.length >= 10 && (
                <div className="text-yellow-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Достигнут лимит предметов (10/10)
                </div>
              )}
            </div>

            {isLoadingItems ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <span className="ml-3 text-gray-400">{t('upgrade.loading_items')}</span>
              </div>
            ) : itemsError ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{t('upgrade.error_loading_items')}</p>
                <button
                  onClick={() => refetchItems()}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  {t('upgrade.try_again')}
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg mb-2">{t('upgrade.no_items_available')}</p>
                <p className="text-gray-500 text-sm">{t('upgrade.open_cases_to_upgrade')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
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
          <div className="bg-[#1a1426]/80 backdrop-blur-md rounded-xl p-6 border border-purple-800/30">
            <h2 className="text-xl font-bold text-white mb-6">
              {t('upgrade.step_2_title')}
            </h2>

            {selectedItemIds.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <p className="text-gray-400">Сначала выберите предметы для улучшения</p>
              </div>
            ) : isLoadingOptions ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">{t('upgrade.loading_options')}</span>
              </div>
            ) : upgradeOptions?.data?.upgrade_options.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('upgrade.no_upgrade_options')}</p>
                <p className="text-gray-500 text-sm mt-2">Попробуйте выбрать предметы подешевле или больше предметов</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
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
