import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/hooks';
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

interface UpgradeResult {
  upgrade_success: boolean;
  data: {
    source_items: any[];
    result_item?: any;
    target_item?: any;
    success_chance: number;
    rolled_value: number;
    total_source_price: number;
    quantity_bonus: number;
  };
}

// Компонент анимации апгрейда с рулеткой
const UpgradeAnimation: React.FC<{
  isActive: boolean;
  result: UpgradeResult | null;
  onComplete: () => void;
}> = ({ isActive, result, onComplete }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'preparing' | 'spinning' | 'showing_result'>('preparing');
  const [finalRotation, setFinalRotation] = useState(0);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const animationStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (isActive && result && !animationStartedRef.current) {
      animationStartedRef.current = true;
      console.log('Upgrade result data:', result.data);

      // Сбрасываем состояние
      setPhase('preparing');

      // Вычисляем финальный поворот на основе rolled_value
      const rolledValue = result.data.rolled_value;
      const successChance = result.data.success_chance;

      // Используем ФАКТИЧЕСКИЙ результат с сервера, а не вычисляем логику сами
      const isActualSuccess = result.upgrade_success;
      let targetAngle: number;

      console.log('🎰 Debug рулетки:', {
        rolledValue,
        successChance,
        isActualSuccess,
        serverSays: isActualSuccess ? 'УСПЕХ' : 'НЕУДАЧА'
      });

      // ПРОСТАЯ ЛОГИКА БЕЗ ЕБЛИ:
      if (isActualSuccess) {
        // УСПЕХ - крутим так, чтобы стрелка попала в ЗЕЛЕНУЮ зону
        // Зеленая зона: от 0° до (successChance/100 * 360)°
        const greenZoneSize = (successChance / 100) * 360;
        targetAngle = greenZoneSize / 2; // середина зеленой зоны
        console.log('✅ УСПЕХ: угол =', targetAngle, '(зеленая зона 0°-' + greenZoneSize + '°)');
      } else {
        // НЕУДАЧА - крутим так, чтобы стрелка попала в КРАСНУЮ зону
        // Красная зона: от (successChance/100 * 360)° до 360°
        const redZoneStart = (successChance / 100) * 360;
        const redZoneSize = 360 - redZoneStart;
        targetAngle = redZoneStart + (redZoneSize / 2); // середина красной зоны
        console.log('❌ НЕУДАЧА: угол =', targetAngle, '(красная зона ' + redZoneStart + '°-360°)');
      }

      // Добавляем несколько полных оборотов для эффекта кручения
      const fullRotations = 720 + 360; // 3 полных оборота

      // ИНВЕРТИРУЕМ угол, потому что рулетка крутится ПРОТИВ часовой стрелки!
      // Если нужно попасть в угол X, то крутим на -X
      const finalAngle = fullRotations - targetAngle;

      console.log('🎯 ФИНАЛЬНЫЕ УГЛЫ:', {
        targetAngle,
        finalAngle,
        successChance,
        isActualSuccess
      });

      setFinalRotation(finalAngle);

      // Начинаем анимацию через небольшую задержку
      setTimeout(() => {
        setPhase('spinning');

        // Завершаем кручение через время анимации
        setTimeout(() => {
          setPhase('showing_result');

          // Закрываем анимацию через 2 секунды
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 3000); // 3 секунды на кручение
      }, 500);
    } else if (!isActive) {
      // Сбрасываем состояние когда анимация неактивна
      animationStartedRef.current = false;
      setPhase('preparing');
      setFinalRotation(0);
    }
  }, [isActive, result]);

  if (!isActive || !result) return null;

  const getResultColor = (success: boolean) => {
    return success ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-600';
  };

  const getPhaseTitles = () => {
    switch (phase) {
      case 'preparing':
        return {
          title: '🎲 Подготовка...',
          subtitle: 'Настраиваем рулетку для вашего апгрейда'
        };
      case 'spinning':
        return {
          title: '🎰 Рулетка крутится!',
          subtitle: 'Определяем ваш результат...'
        };
      case 'showing_result':
        return {
          title: result.upgrade_success ? '🎉 УСПЕХ!' : '💔 НЕУДАЧА',
          subtitle: result.upgrade_success
            ? 'Поздравляем с успешным апгрейдом!'
            : 'К сожалению, на этот раз не повезло'
        };
    }
  };

  const titles = getPhaseTitles();

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="text-center max-w-3xl mx-auto px-6">
        {/* Заголовок */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 transition-all duration-500">
            {titles.title}
          </h2>
          <p className="text-gray-300 text-lg transition-all duration-500">
            {titles.subtitle}
          </p>
        </div>

        {/* Рулетка */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            {/* Указатель сверху - НЕПОДВИЖНЫЙ */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-yellow-400 z-20 drop-shadow-lg"></div>

            {/* Круглая рулетка - ВРАЩАЕТСЯ */}
            <div
              ref={wheelRef}
              className="w-80 h-80 rounded-full border-8 border-gray-600 relative overflow-hidden shadow-2xl"
              style={{
                background: `conic-gradient(
                  #10b981 0% ${result.data.success_chance}%,
                  #ef4444 ${result.data.success_chance}% 100%
                )`,
                transform: phase === 'spinning' ? `rotate(${finalRotation}deg)` : 'rotate(0deg)',
                transition: phase === 'spinning' ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              {/* Центральный круг */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-900 rounded-full border-4 border-gray-700 flex items-center justify-center shadow-inner">
                <div className="text-white font-bold text-sm text-center">
                  <div>{result.data.success_chance}%</div>
                  <div className="text-xs text-gray-300">шанс</div>
                </div>
              </div>

              {/* Метки на рулетке */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-xl drop-shadow-lg">
                ✅
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-xl drop-shadow-lg">
                ❌
              </div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-bold text-lg drop-shadow-lg">
                {result.upgrade_success ? '🍀' : '💀'}
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold text-lg drop-shadow-lg">
                {result.upgrade_success ? '⭐' : '💥'}
              </div>
            </div>

            {/* Результат в центре */}
            {phase === 'showing_result' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-bold animate-bounce z-10">
                {result.upgrade_success ? '✅' : '❌'}
              </div>
            )}
          </div>
        </div>

        {/* Детальная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/50 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
            <div className="text-cyan-400 text-sm font-medium mb-1">Шанс успеха</div>
            <div className="text-white text-xl font-bold">
              {result.data.success_chance.toFixed(1)}%
              {result.data.quantity_bonus > 0 && (
                <span className="text-green-400 text-sm ml-2">+{result.data.quantity_bonus}%</span>
              )}
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm">
            <div className="text-purple-400 text-sm font-medium mb-1">Выпавшее число</div>
            <div className="text-white text-xl font-bold">
              {phase === 'showing_result' ? result.data.rolled_value.toFixed(1) : '???'}
              {phase === 'showing_result' && (
                <div className={`text-sm mt-1 ${result.upgrade_success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.upgrade_success ? '≤ ' + result.data.success_chance.toFixed(1) : '> ' + result.data.success_chance.toFixed(1)}
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-4 border border-green-500/30 backdrop-blur-sm">
            <div className="text-green-400 text-sm font-medium mb-1">Стоимость ставки</div>
            <div className="text-white text-xl font-bold">
              <Monetary value={result.data.total_source_price} />
            </div>
          </div>
        </div>

        {/* Итоговый результат */}
        {phase === 'showing_result' && (
          <div className={`bg-gradient-to-r ${getResultColor(result.upgrade_success)} rounded-xl p-6 border-2 animate-pulse shadow-2xl`}>
            <div className="text-white">
              <div className="text-3xl font-bold mb-3">
                {result.upgrade_success ? '🎊 УСПЕШНЫЙ АПГРЕЙД! 🎊' : '💸 НЕУДАЧНЫЙ АПГРЕЙД 💸'}
              </div>
              {result.upgrade_success && result.data.result_item && (
                <div className="text-xl mb-2">
                  Получен: <span className="font-bold text-yellow-200">{result.data.result_item.name}</span>
                </div>
              )}
              <div className="text-lg opacity-90">
                Потрачено предметов на сумму: <Monetary value={result.data.total_source_price} />
              </div>
            </div>
          </div>
        )}

        {/* Прогресс бар */}
        <div className="mt-6">
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 shadow-lg"
              style={{
                width: phase === 'preparing' ? '20%' : phase === 'spinning' ? '80%' : '100%'
              }}
            ></div>
          </div>
          <div className="text-gray-400 text-sm mt-2 font-medium">
            {phase === 'preparing' && 'Подготовка анимации...'}
            {phase === 'spinning' && `Кручение рулетки... (${result.data.rolled_value.toFixed(1)} из 100)`}
            {phase === 'showing_result' && 'Результат определен!'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки предмета для выбора
const SourceItemCard: React.FC<{
  itemGroup: any;
  onSelect: (itemId: string) => void;
  selectedItemIds: string[];
  selectedInventoryIds: string[];
}> = ({ itemGroup, onSelect, selectedItemIds, selectedInventoryIds }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const { item, count, instances } = itemGroup;

  const isSelected = selectedItemIds.includes(item.id);
  const selectedCount = selectedInventoryIds.filter(id =>
    instances.some((inst: any) => inst.id === id)
  ).length;

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
      className={`bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-xl p-3 border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
        isSelected
          ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
          : 'border-purple-800/30 hover:border-purple-600/50 hover:shadow-purple-500/20'
      }`}
      onClick={() => onSelect(item.id)}
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
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-bold z-20">
            {selectedCount > 0 ? `${selectedCount}/${count}` : `x${count}`}
          </div>

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
              <Monetary value={parseFloat(item.price)} />
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
      className={`bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-xl p-3 border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
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

          {/* Бонус за количество */}
          {item.quantity_bonus > 0 && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-green-600/80 text-white text-xs font-bold z-20">
              +{item.quantity_bonus}%
            </div>
          )}

          {/* Индикатор выбора */}
          {isSelected && (
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg z-15 flex items-center justify-center">
              <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                <Monetary value={parseFloat(item.price)} />
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



  // Фильтрация предметов (убираем ограничение по минимальной цене)
  const filteredItems = React.useMemo(() => {
    if (!upgradeableItems?.data?.items) return [];

    return upgradeableItems.data.items.filter(itemGroup =>
      itemGroup.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      // Убрали: && itemGroup.item.price >= 10 - теперь можно улучшать любые предметы
    );
  }, [upgradeableItems, searchTerm]);

  // Обработчик выбора исходных предметов
  const handleSelectSourceItem = useCallback((itemId: string) => {
    const itemGroup = filteredItems.find(group => group.item.id === itemId);
    if (!itemGroup) return;

    // Находим доступные экземпляры этого предмета, которые еще не выбраны
    const availableInstances = itemGroup.instances.filter((inst: any) =>
      !selectedInventoryIds.includes(inst.id)
    );

    if (availableInstances.length > 0) {
      // Добавляем один экземпляр
      const newInventoryId = availableInstances[0].id;
      setSelectedInventoryIds(prev => [...prev, newInventoryId]);

      // Добавляем ID предмета, если его еще нет
      if (!selectedItemIds.includes(itemId)) {
        setSelectedItemIds(prev => [...prev, itemId]);
      }
    } else {
      // Если экземпляров больше нет, убираем предмет из выбранных
      const remainingInventoryIds = selectedInventoryIds.filter(id =>
        !itemGroup.instances.some((inst: any) => inst.id === id)
      );
      setSelectedInventoryIds(remainingInventoryIds);

      // Проверяем, есть ли еще экземпляры этого предмета в выборе
      const hasOtherInstances = remainingInventoryIds.some(id =>
        itemGroup.instances.some((inst: any) => inst.id === id)
      );

      if (!hasOtherInstances) {
        setSelectedItemIds(prev => prev.filter(id => id !== itemId));
      }
    }

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
    setSelectedTargetItem(itemId);
  }, []);

  // Подсчет общей стоимости выбранных предметов
  const totalSelectedPrice = React.useMemo(() => {
    if (!upgradeableItems?.data?.items || selectedInventoryIds.length === 0) return 0;

    let total = 0;
    upgradeableItems.data.items.forEach(itemGroup => {
      itemGroup.instances.forEach((inst: any) => {
        if (selectedInventoryIds.includes(inst.id)) {
          total += itemGroup.item.price;
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
          quantity_bonus: result.data.quantity_bonus
        }
      };
      setUpgradeResult(adaptedResult);
      setShowAnimation(true);

    } catch (error: any) {
      console.error('Ошибка при апгрейде:', error);
      const errorMessage = error?.data?.message || error?.message || t('errors.server_error');
      toast.error(errorMessage);
    }
  };

  // Обработчик завершения анимации
  const handleAnimationComplete = () => {
    setShowAnimation(false);

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

      // Сбрасываем выбор и обновляем данные
      setSelectedItemIds([]);
      setSelectedInventoryIds([]);
      setSelectedTargetItem('');
      setUpgradeResult(null);
      refetchItems();
    }
  };

  return (
    <div className="min-h-screen bg-[#151225] text-white">
      <ScrollToTopOnMount />

      {/* Анимация апгрейда */}
      <UpgradeAnimation
        isActive={showAnimation}
        result={upgradeResult}
        onComplete={handleAnimationComplete}
      />

      <div className="container mx-auto px-4 py-8">
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

        {/* Информационная панель */}
        <div className="bg-gradient-to-r from-amber-600/10 to-red-600/10 rounded-xl p-6 mb-8 border border-amber-500/30">
          <div className="flex items-start space-x-4">
            <div className="text-amber-400 text-2xl">⚠️</div>
            <div>
              <h3 className="text-amber-300 font-semibold text-lg mb-2">{t('upgrade.warning_title')}</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• При неудачном апгрейде все выбранные предметы будут потеряны</li>
                <li>• Чем больше предметов выберете, тем больше шанс успеха (+2% за каждый дополнительный)</li>
                <li>• Целевой предмет должен быть дороже общей стоимости ваших предметов</li>
                <li>• Теперь можно улучшать предметы любой стоимости, даже копейки!</li>
                <li>• Максимум 10 предметов можно выбрать для одного улучшения</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="bg-gradient-to-r from-[#1a1426] to-[#2a1a3a] rounded-xl border border-purple-500/30 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Информация о выбранных предметах */}
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/50">
              <div className="text-cyan-400 text-sm font-medium mb-2">Выбрано предметов</div>
              <div className="text-white text-xl font-bold">
                {selectedInventoryIds.length}
              </div>
              <div className="text-gray-300 text-sm">
                Общая стоимость: <Monetary value={totalSelectedPrice} />
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/50">
              <div className="text-purple-400 text-sm font-medium mb-2">{t('upgrade.selected_target')}</div>
              {selectedTargetItem ? (
                <div className="text-white">
                  {upgradeOptions?.data?.upgrade_options.find(item => item.id === selectedTargetItem)?.name || t('upgrade.not_selected')}
                </div>
              ) : (
                <div className="text-gray-400">{t('upgrade.not_selected')}</div>
              )}
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-green-500/50">
              <div className="text-green-400 text-sm font-medium mb-2">Бонус за количество</div>
              <div className="text-white text-xl font-bold">
                +{Math.min(18, (selectedInventoryIds.length - 1) * 2)}%
              </div>
              <div className="text-gray-300 text-sm">
                Дополнительный шанс
              </div>
            </div>
          </div>

          {/* Поиск и кнопки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('upgrade.search_placeholder')}
              className="bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
            />

            <button
              onClick={handleClearSelection}
              disabled={selectedInventoryIds.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Сбросить выбор ({selectedInventoryIds.length})
            </button>
          </div>

          {/* Кнопка апгрейда */}
          <div className="text-center">
            <button
              onClick={handlePerformUpgrade}
              disabled={selectedInventoryIds.length === 0 || !selectedTargetItem || isUpgrading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-8 rounded-lg font-semibold text-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isUpgrading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('upgrade.processing')}
                </div>
              ) : (
                `Улучшить ${selectedInventoryIds.length} предметов`
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Выбор исходных предметов */}
          <div className="bg-[#1a1426] rounded-xl p-6 border border-purple-800/30">
            <h2 className="text-xl font-bold text-white mb-6">
              {t('upgrade.step_1_title')} ({selectedInventoryIds.length}/10)
            </h2>

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
                  />
                ))}
              </div>
            )}
          </div>

          {/* Выбор целевого предмета */}
          <div className="bg-[#1a1426] rounded-xl p-6 border border-purple-800/30">
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
                {totalSelectedPrice > 0 && (
                  <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <div className="text-cyan-300 text-sm">
                      Общая стоимость ваших предметов: <span className="font-bold"><Monetary value={totalSelectedPrice} /></span>
                    </div>
                  </div>
                )}

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
