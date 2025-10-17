import React, { useMemo, useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../../features/cases/casesApi';
import { CaseTemplate } from '../../types/api';
import Monetary from '../Monetary';
import { useUserData } from '../../hooks/useUserData';
import { CaseItem } from './components/CaseItem';
import { StaticCaseItem } from './components/StaticCaseItem';
import { VirtualizedGrid } from './components/VirtualizedGrid';
import { CasePreviewModalProps } from './types';
import { getRarityColor, generateGoldenSparks, getDefaultCaseImage } from './utils';
import { injectStyles } from './styles';
import { DEFAULT_CASE_IMAGES } from './constants';

// Добавляем стили в head только один раз
injectStyles();


const CasePreviewModal: React.FC<CasePreviewModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onBuyAndOpenCase,
  fixedPrices = false,
  onDataUpdate
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Получаем данные пользователя для учета бонусов (должно быть в начале)
  const { userData } = useUserData();

  // State должен быть объявлен до использования в функциях
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'bank_card'>('balance');

  // Получаем данные кейса и статус
  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(
    caseData.id,
    { skip: !isOpen }
  );

  const { data: statusData, isLoading: statusLoading } = useGetCaseStatusQuery(
    caseData.id,
    { skip: !isOpen }
  );

  // Функция для получения цены кейса
  const getCasePrice = useCallback((caseData: CaseTemplate): number => {
    if (statusData?.data?.price) {
      return statusData.data.price;
    }
    // Fallback на статические цены
    return caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум') ? 499 : 99;
  }, [statusData]);

  // Проверяем, достаточно ли средств на балансе
  const checkBalanceSufficient = useCallback((price: number): boolean => {
    if (paymentMethod === 'bank_card') return true; // Для карты всегда true
    return (userData?.balance || 0) >= price;
  }, [paymentMethod, userData]);

  // Автоматически переключаем на карту, если недостаточно баланса
  useEffect(() => {
    if (userData && paymentMethod === 'balance') {
      const price = getCasePrice(caseData);
      if ((userData.balance || 0) < price) {
        // Не переключаем автоматически, оставляем выбор пользователю
        console.log('Недостаточно баланса, но оставляем выбор пользователю');
      }
    }
  }, [userData, caseData, paymentMethod, getCasePrice]);

  // Проверяем авторизацию пользователя
  useEffect(() => {
    if (isOpen && !userData) {
      // Если модал открыт, но пользователь не авторизован, перенаправляем на страницу входа
      onClose(); // Закрываем модал
      navigate('/login'); // Перенаправляем на страницу входа
    }
  }, [isOpen, userData, navigate, onClose]);

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Состояния для защиты от множественных кликов
  const [isProcessing, setIsProcessing] = useState(false);

  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [openingResult, setOpeningResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle');
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [showGoldenSparks, setShowGoldenSparks] = useState(false);

  // Ref для контейнера со скроллом
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [buyCase, { isLoading: buyLoading }] = useBuyCaseMutation();
  const [openCase, { isLoading: openLoading }] = useOpenCaseMutation();

  // Оптимизированный useEffect для открытия/закрытия модала
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Сбрасываем состояние анимации и обработки
      setIsProcessing(false);
      setSliderPosition(0);
      setAnimationPhase('idle');
      setShowOpeningAnimation(false);
      setOpeningResult(null);
      setShowStrikeThrough(false);
      setShowGoldenSparks(false);
      // Блокируем скролл основной страницы
      document.body.style.overflow = 'hidden';
      // Небольшая задержка для запуска анимации после рендера
      const timer = setTimeout(() => setIsAnimating(true), 16); // Один кадр
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setIsProcessing(false);
      // Возвращаем скролл основной страницы
      document.body.style.overflow = 'unset';
      // Скрываем модалку после завершения анимации закрытия
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      // Восстанавливаем скролл при размонтировании
      document.body.style.overflow = 'unset';
      // Очищаем таймеры
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Оптимизированный автоматический скроллинг
  const scrollToItem = useCallback((itemIndex: number) => {
    if (!scrollContainerRef.current || !showOpeningAnimation) return;

    const container = scrollContainerRef.current;
    const items = container.querySelectorAll('[data-item-index]');
    const currentItem = items[itemIndex] as HTMLElement;

    if (currentItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();

      // Вычисляем позицию элемента относительно контейнера
      const itemTop = itemRect.top - containerRect.top + container.scrollTop;
      const containerHeight = container.clientHeight;

      // Определяем целевую позицию скролла (центрируем элемент)
      const targetScrollTop = itemTop - (containerHeight / 2) + (itemRect.height / 2);

      // Скроллим
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [showOpeningAnimation]);

  // Debounced scroll effect
  useEffect(() => {
    if (!showOpeningAnimation) return;

    const timeoutId = setTimeout(() => {
      scrollToItem(sliderPosition);
    }, animationPhase === 'spinning' ? 100 : 200);

    return () => clearTimeout(timeoutId);
  }, [sliderPosition, showOpeningAnimation, animationPhase, scrollToItem]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  // Определяем, исключать ли предметы в зависимости от ID кейса
  const itemsWithAdjustedChances = useMemo(() => {
    const items = itemsData?.data?.items || [];
    if (!items || items.length === 0) return [];

    // Проверяем, является ли это ежедневным кейсом
    const isDailyCase = caseData.id === "44444444-4444-4444-4444-444444444444";

    // Теперь используем данные от сервера, но применяем исключение только для ежедневного кейса
    const processedItems = items.map(item => ({
      ...item,
      // Исключаем предметы только для ежедневного кейса с ID 444444...
      isExcluded: isDailyCase ? (item.is_excluded || false) : false,
      isAlreadyWon: item.is_already_dropped || false,
      // Остальные поля уже рассчитаны сервером
      drop_chance_percent: item.drop_chance_percent || 0,
      modifiedWeight: item.modified_weight || item.drop_weight || 0,
      weightMultiplier: item.weight_multiplier || 1,
      bonusApplied: item.bonus_applied || 0
    }));

    // Отладочная информация
    const excludedItems = processedItems.filter(item => item.isExcluded);
    if (excludedItems.length > 0) {
      console.log('🚫 Исключенные предметы (уже получены) для кейса', caseData.id, ':', excludedItems.map(item => ({
        id: item.id,
        name: item.name,
        isExcluded: item.isExcluded,
        isAlreadyDropped: item.isAlreadyWon
      })));
    }

    if (!isDailyCase) {
      console.log('ℹ️ Для кейса', caseData.id, 'предметы НЕ исключаются - могут выпадать повторно');
    }

    return processedItems;
  }, [itemsData?.data?.items, caseData.id]);

  // Перемещаем объявления функций выше их использования
  const startAnimation = useCallback((wonItem: any) => {
    setShowOpeningAnimation(true);
    setAnimationPhase('spinning');
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);

    // ИСПРАВЛЕНИЕ: Используем ТОЛЬКО доступные (неисключенные) предметы для анимации
    const availableItemsForAnimation = itemsWithAdjustedChances.filter(item => !item.isExcluded);

    console.log('АНИМАЦИЯ: Всего предметов в кейсе:', itemsWithAdjustedChances.length);
    console.log('АНИМАЦИЯ: Доступных предметов для анимации:', availableItemsForAnimation.length);
    console.log('АНИМАЦИЯ: Исключенных предметов:', itemsWithAdjustedChances.length - availableItemsForAnimation.length);
    console.log('АНИМАЦИЯ: Выигранный предмет:', wonItem.name, wonItem.id);

    // Находим индекс выигранного предмета в списке ДОСТУПНЫХ предметов
    const wonItemIndex = availableItemsForAnimation.findIndex(item => item.id === wonItem.id);

    if (wonItemIndex === -1) {
      console.error('ОШИБКА АНИМАЦИИ: Выигранный предмет не найден в списке доступных предметов');
      console.log('Выигранный предмет:', wonItem);
      console.log('Доступные предметы:', availableItemsForAnimation.map(item => ({ id: item.id, name: item.name })));

      // Fallback: показываем результат без анимации
      setAnimationPhase('stopped');
      setTimeout(() => {
        handleAnimationComplete();
      }, 1500);
      return;
    }

    console.log('АНИМАЦИЯ: Целевой предмет:', wonItem.name, 'в позиции:', wonItemIndex, '(среди доступных)');

    // Сбрасываем позицию в начало и скроллим к началу списка
    setSliderPosition(0);

    // Прокручиваем контейнер к началу
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Настройки анимации
    let currentAvailablePosition = 0;
    let initialSpeed = 150; // начальная скорость
    let currentSpeed = initialSpeed;

    // Рассчитываем расстояние до цели в доступных предметах
    const distance = wonItemIndex;
    const slowDownStart = Math.max(0, distance - 7); // начинаем замедляться за 7 шагов до цели

    const animateSlider = () => {
      // Если дошли до цели - останавливаемся
      if (currentAvailablePosition >= wonItemIndex) {
        // Находим индекс выигранного предмета в полном списке для корректного отображения
        const wonItemInFullList = itemsWithAdjustedChances.findIndex(item => item.id === wonItem.id);
        setSliderPosition(wonItemInFullList);
        setAnimationPhase('stopped');

        // Запускаем эффект золотых искр через 1 секунду после остановки
        setTimeout(() => {
          setShowGoldenSparks(true);
        }, 1000);

        setTimeout(() => {
          // Анимация перечёркивания только для ежедневного кейса с ID 444444
          if (caseData.id === "44444444-4444-4444-4444-444444444444" || caseData.id === '44444444-4444-4444-4444-444444444444') {
            setShowStrikeThrough(true);
          }
        }, 2000);

        setTimeout(() => {
          handleAnimationComplete();
        }, caseData.id === '44444444-4444-4444-4444-444444444444' || caseData.id === '44444444-4444-4444-4444-444444444444' ? 5000 : 3500);
        return;
      }

      // Двигаемся на следующую позицию среди доступных предметов
      currentAvailablePosition++;

      // Находим соответствующую позицию в полном списке
      let fullListPosition = 0;
      let availableCount = 0;
      for (let i = 0; i < itemsWithAdjustedChances.length; i++) {
        if (!itemsWithAdjustedChances[i].isExcluded) {
          if (availableCount === currentAvailablePosition) {
            fullListPosition = i;
            break;
          }
          availableCount++;
        }
      }

      setSliderPosition(fullListPosition);

      // Если еще не дошли до зоны замедления - быстро крутим
      if (currentAvailablePosition <= slowDownStart) {
        setAnimationPhase('spinning');
        currentSpeed = initialSpeed;
      } else {
        // Начинаем замедляться
        setAnimationPhase('slowing');
        const stepsLeft = wonItemIndex - currentAvailablePosition;
        const slowdownFactor = Math.max(0.1, stepsLeft / 7);
        currentSpeed = initialSpeed + (300 * (1 - slowdownFactor));
      }

      // Продолжаем анимацию
      setTimeout(animateSlider, currentSpeed);
    };

    // Запускаем анимацию после небольшой задержки
    setTimeout(() => {
      animateSlider();
    }, 500);
  }, [itemsWithAdjustedChances, caseData.id]);

  const handleBuyCase = async () => {
    // Защита от множественных кликов
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) {
      console.log('Операция уже выполняется, игнорируем клик');
      return;
    }

    setIsProcessing(true);
    console.log('handleBuyCase вызван:', { fixedPrices, paymentMethod, onBuyAndOpenCase: !!onBuyAndOpenCase });

    try {
      // Если есть внешний обработчик, получаем результат и запускаем нашу анимацию
      if (onBuyAndOpenCase) {
        try {
          console.log('Используем внешний обработчик onBuyAndOpenCase');
          const result = await onBuyAndOpenCase(caseData);

          // Если получили результат, запускаем анимацию в модале
          if (result && result.item) {
            setOpeningResult(result);
            startAnimation(result.item);
          }
        } catch (error: any) {
          console.error('Ошибка покупки кейса через внешний обработчик:', error);
          alert('Ошибка покупки кейса: ' + (error?.message || 'Неизвестная ошибка'));
        }
        return;
      }

      // Иначе используем внутреннюю логику с выбором метода оплаты
      console.log('Используем внутреннюю логику покупки');
      const buyParams = {
        case_template_id: caseData.id,
        caseTemplateId: caseData.id,
        method: paymentMethod,
        quantity: 1
      };
      console.log('Параметры покупки:', buyParams);

      const result = await buyCase(buyParams).unwrap();
      console.log('Результат покупки:', result);

      if (result.success) {
        if (paymentMethod === 'bank_card') {
          // Если оплата через карту, перенаправляем на страницу оплаты
          if (result.data?.paymentUrl) {
            window.location.href = result.data.paymentUrl;
          } else {
            alert('Ошибка: не получена ссылка для оплаты');
          }
        } else {
          // Если оплата через баланс, сразу открываем кейс
          if (result.data?.inventory_cases && result.data.inventory_cases.length > 0) {
            const inventoryCase = result.data.inventory_cases[0];
            console.log('Открываем кейс из инвентаря:', inventoryCase.id);
            await handleOpenCase(undefined, inventoryCase.id);
          } else {
            console.log('Кейс куплен, но нет inventory_cases в ответе. Закрываем модалку.');
            alert('Кейс успешно куплен!');
            handleClose();
          }
        }
      } else {
        console.error('Покупка не удалась:', result);
        alert('Ошибка покупки: ' + (result.message || 'Неизвестная ошибка'));
      }
    } catch (error: any) {
      console.error('Ошибка покупки кейса:', error);

      // Обрабатываем ошибку недостаточного баланса
      if (error?.status === 400 && error?.data?.message?.includes('Недостаточно средств')) {
        const requiredAmount = error?.data?.required || 0;
        const availableAmount = error?.data?.available || 0;
        const shortfall = requiredAmount - availableAmount;

        alert(`Недостаточно средств на балансе!\nТребуется: ${requiredAmount}₽\nДоступно: ${availableAmount}₽\nНе хватает: ${shortfall}₽`);
      } else {
        alert('Ошибка покупки кейса: ' + (error?.data?.message || error?.message || 'Неизвестная ошибка'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCase = async (caseId?: string, inventoryItemId?: string) => {
    // Защита от множественных кликов
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) {
      console.log('Операция уже выполняется, игнорируем клик');
      return;
    }

    setIsProcessing(true);

    try {
      const openCaseParams: any = {};

      if (inventoryItemId) {
        // Открываем кейс из инвентаря (покупные кейсы)
        openCaseParams.inventoryItemId = inventoryItemId;
      } else if (caseId) {
        // Открываем кейс по case_id (старый метод)
        openCaseParams.case_id = caseId;
      } else {
        // Для бесплатных кейсов используем template_id
        // Бэкенд сам найдет подходящий кейс пользователя по шаблону
        console.log('Открываем бесплатный кейс по template_id:', caseData.id);
        openCaseParams.template_id = caseData.id;
      }

      console.log('Параметры открытия кейса:', openCaseParams);
      const result = await openCase(openCaseParams).unwrap();

      if (result.success && result.data?.item) {
        setOpeningResult(result.data);
        startAnimation(result.data.item);
      }
    } catch (error: any) {
      console.error('Ошибка открытия кейса:', error);

      // Если ошибка связана с тем, что кейс уже получен сегодня, закрываем модал и обновляем данные
      if (error?.data?.message?.includes('уже получали') || error?.data?.message?.includes('завтра')) {
        // Показываем сообщение пользователю
        alert(error.data.message || 'Кейс уже получен сегодня');

        // Закрываем модал
        onClose();

        // Обновляем данные в родительском компоненте
        if (onDataUpdate) {
          setTimeout(() => {
            onDataUpdate();
          }, 100);
        }
      } else {
        // Для других ошибок показываем общее сообщение
        alert(error?.data?.message || 'Произошла ошибка при открытии кейса');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    setShowOpeningAnimation(false);
    setOpeningResult(null);
    setAnimationPhase('idle');
    setSliderPosition(0);
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);
    setIsProcessing(false);

    // Очищаем таймеры
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  // Оптимизированная функция для создания золотых искр
  if (!isVisible) return null;

  // Определяем изображение кейса
  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? caseData.image_url
    : getDefaultCaseImage(caseData.name);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isAnimating
          ? 'bg-black bg-opacity-75 backdrop-blur-sm'
          : 'bg-black bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#1a1629] rounded-lg max-w-6xl w-[95%] sm:w-full mx-4 max-h-[90vh] shadow-2xl transition-all duration-1000 flex flex-col ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-75 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок модального окна */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={caseImageUrl}
              alt={caseData.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{caseData.name}</h2>
              <p className="text-green-400 font-semibold">
                {fixedPrices ? (
                  <span className="text-yellow-400 font-bold">
                    {caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум')
                      ? '499₽'
                      : '99₽'
                    }
                  </span>
                ) : (
                  parseFloat(caseData.price) === 0 || isNaN(parseFloat(caseData.price)) ? (
                    <span>{t('case_preview_modal.free_case')}</span>
                  ) : (
                    <Monetary value={parseFloat(caseData.price)} />
                  )
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Содержимое кейса */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-6 overflow-y-auto relative"
          style={{ maxHeight: 'calc(90vh - 200px)' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
              <p className="text-white ml-4">{t('case_preview_modal.loading_items')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{t('case_preview_modal.loading_error')}</p>
            </div>
          ) : itemsWithAdjustedChances.length > 0 ? (
            <div className="relative">
              {/* Если анимация идет - показываем все элементы, иначе виртуализируем */}
              {showOpeningAnimation ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                  {itemsWithAdjustedChances.map((item: any, index: number) => {
                    const animationIndex = index;
                    const isCurrentSliderPosition = showOpeningAnimation && sliderPosition === animationIndex;
                    const isWinningItem = showOpeningAnimation && openingResult && openingResult.item.id === item.id;
                    const isWinningItemStopped = animationPhase === 'stopped' && openingResult && openingResult.item.id === item.id;
                    const isDailyCase = caseData.id === '44444444-4444-4444-4444-444444444444';

                    // Предвычисляем классы для оптимизации
                    const baseClasses = `bg-gray-800 rounded-lg p-2 border-2 relative ${getRarityColor(item.rarity)}`;
                    const animationClasses = !showOpeningAnimation ? 'hover:scale-105 transition-transform duration-200' : '';
                    const highlightClasses = isCurrentSliderPosition ? 'ring-2 ring-yellow-400 z-10 border-yellow-400' : '';
                    const winningClasses = isWinningItemStopped ? `ring-2 ring-green-400 z-20 border-green-400 ${showGoldenSparks ? 'victory-glow' : ''}` : '';
                    const glowClasses = isWinningItemStopped && showStrikeThrough && isDailyCase ? 'animate-item-glow' : '';
                    const excludedClasses = (item.isExcluded && !isWinningItem) || (isWinningItemStopped && showStrikeThrough && isDailyCase) ? 'opacity-50 grayscale' : '';
                    const performanceClass = (isCurrentSliderPosition || isWinningItemStopped) ? 'gpu-layer' : 'no-gpu-layer';

                    return (
                      <div
                        key={item.id || index}
                        data-item-index={animationIndex}
                        className={`${baseClasses} ${animationClasses} ${highlightClasses} ${winningClasses} ${glowClasses} ${excludedClasses} ${performanceClass}`}
                      >
                        <div className="aspect-square mb-2 bg-gray-900 rounded flex items-center justify-center relative">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className={`max-w-full max-h-full object-contain relative z-0 ${item.isExcluded ? 'opacity-70' : ''}`}
                              style={{
                                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                mixBlendMode: 'normal',
                              }}
                              loading="lazy"
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.backgroundColor = 'transparent';
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.error-placeholder')) {
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'error-placeholder text-gray-500 text-xs text-center absolute inset-0 flex items-center justify-center z-0';
                                  errorDiv.textContent = t('case_preview_modal.no_image');
                                  parent.appendChild(errorDiv);
                                }
                              }}
                            />
                          ) : (
                            <div className="text-gray-500 text-xs text-center absolute inset-0 flex items-center justify-center z-0">
                              {t('case_preview_modal.no_image')}
                            </div>
                          )}

                          {/* Оригинальное перечеркивание */}
                          {((item.isExcluded && !(showOpeningAnimation && isWinningItem)) || (isWinningItemStopped && showStrikeThrough && isDailyCase)) && (
                            <div className="absolute inset-0 z-20">
                              <div className={`absolute inset-0 bg-black bg-opacity-40 ${
                                isWinningItemStopped && showStrikeThrough ? 'animate-overlay-fade' : ''
                              }`}></div>

                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`absolute bg-red-500 rounded-full ${
                                  isWinningItemStopped && showStrikeThrough ? 'animate-cross-line-1' : 'w-0 h-0 opacity-0'
                                }`} style={{ transform: 'rotate(45deg)' }}></div>

                                <div className={`absolute bg-red-500 rounded-full ${
                                  isWinningItemStopped && showStrikeThrough ? 'animate-cross-line-2' : 'w-0 h-0 opacity-0'
                                }`} style={{ transform: 'rotate(-45deg)' }}></div>
                              </div>

                              {isWinningItemStopped && showStrikeThrough && (
                                <div className="absolute top-1 right-1 animate-checkmark-bounce">
                                  <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded font-bold">
                                    ✓
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Эффект золотых искр */}
                          {showGoldenSparks && isWinningItemStopped && (
                            <div className="absolute inset-0 pointer-events-none z-50">
                              {generateGoldenSparks()}
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <h3 className="text-white font-semibold text-sm mb-1 overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.2em',
                                maxHeight: '2.4em'
                              }}>
                            {item.name}
                          </h3>

                          {item.rarity && (
                            <p className={`text-xs mb-2 ${getRarityColor(item.rarity).split(' ')[0]}`}>
                              {item.rarity}
                            </p>
                          )}

                          <p className="text-green-400 font-bold text-sm">
                            <Monetary value={parseFloat(item.price || '0')} />
                          </p>

                          {!showOpeningAnimation && (
                            <div className="text-xs mt-1">
                              {item.isExcluded ? (
                                <p className="text-red-400 font-bold">
                                  {t('case_preview_modal.already_received')}
                                </p>
                              ) : (
                                <p className="text-gray-400">
                                  {t('case_preview_modal.chance')} {item.drop_chance_percent ? `${item.drop_chance_percent.toFixed(2)}%` : '0%'}
                                  {item.bonusApplied > 0 && parseFloat(item.price || '0') >= 100 && (
                                    <span className="text-yellow-400 ml-1">
                                      (+{(item.bonusApplied * 100).toFixed(1)}% {t('case_preview_modal.bonus')})
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          )}

                          {showOpeningAnimation && isWinningItemStopped && showStrikeThrough && isDailyCase && (
                            <div className="text-xs mt-1">
                              <p className="text-red-400 font-bold">
                                {t('case_preview_modal.received')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <VirtualizedGrid
                  items={itemsWithAdjustedChances}
                  containerHeight={600}
                  getRarityColor={getRarityColor}
                  t={t}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('case_preview_modal.no_items')}</p>
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className="flex-shrink-0 p-6 border-t border-gray-700 bg-[#1a1629]">
          <div className="text-sm text-gray-400 mb-4">
            {statusData?.data && !statusLoading && (
              <div>
                {statusData.data.reason && !statusData.data.canOpen && !statusData.data.canBuy && (
                  <span className="text-red-400">{statusData.data.reason}</span>
                )}
                {statusData.data.subscriptionRequired && (
                  <div className="mt-1">
                    {t('case_preview_modal.subscription_required', { tier: statusData.data.minSubscriptionTier })}
                    <br />
                    {t('case_preview_modal.your_level', { level: statusData.data.userSubscriptionTier })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
              disabled={isProcessing || showOpeningAnimation}
            >
              {t('case_preview_modal.close')}
            </button>

            {fixedPrices ? (
              // Показываем кнопки с выбором метода оплаты для премиум кейсов
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* Селектор метода оплаты */}
                {!showOpeningAnimation && !isProcessing && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-400 whitespace-nowrap">{t('case_preview_modal.payment_method')}</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'balance' | 'bank_card')}
                        className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="balance">{t('case_preview_modal.balance_payment')}</option>
                        <option value="bank_card">{t('case_preview_modal.card_payment')}</option>
                      </select>
                    </div>
                    {paymentMethod === 'balance' && userData && (
                      <div className="flex items-center space-x-1 text-xs">
                        <span className="text-gray-400">💰 Баланс:</span>
                        <span className={`font-bold ${(userData.balance || 0) < getCasePrice(caseData) ? 'text-red-400' : 'text-green-400'}`}>
                          {userData.balance || 0}₽
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Кнопка покупки */}
                {(() => {
                  const price = getCasePrice(caseData);
                  const hasEnoughBalance = checkBalanceSufficient(price);
                  const isDisabled = isProcessing || buyLoading || openLoading || showOpeningAnimation || (!hasEnoughBalance && paymentMethod === 'balance');

                  return (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleBuyCase}
                        disabled={isDisabled}
                        className={`px-6 py-2 text-white rounded transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap ${
                          !hasEnoughBalance && paymentMethod === 'balance'
                            ? 'bg-red-600 hover:bg-red-700 border-2 border-red-400 shadow-lg shadow-red-500/30 animate-pulse'
                            : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                        }`}
                        title={!hasEnoughBalance && paymentMethod === 'balance' ? `Недостаточно средств! Требуется: ${price}₽, доступно: ${userData?.balance || 0}₽` : ''}
                      >
                        {isProcessing || buyLoading || openLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{paymentMethod === 'bank_card' ? t('case_preview_modal.going_to_payment') : t('case_preview_modal.opening')}</span>
                          </>
                        ) : !hasEnoughBalance && paymentMethod === 'balance' ? (
                          <>
                            <span className="text-red-100">💳 Недостаточно средств</span>
                            <span className="text-yellow-400 font-bold">{price}₽</span>
                          </>
                        ) : (
                          <>
                            <span>{paymentMethod === 'bank_card' ? t('case_preview_modal.buy') : t('case_preview_modal.open')}</span>
                            <span className="text-yellow-400 font-bold">{price}₽</span>
                          </>
                        )}
                      </button>
                      {!hasEnoughBalance && paymentMethod === 'balance' && (
                        <div className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-500/30">
                          ⚠️ Не хватает {price - (userData?.balance || 0)}₽
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              // Используем обычную логику для страницы профиля
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {statusData?.data && !statusLoading ? (
                  <>
                    {statusData.data.canBuy && statusData.data.price > 0 && (() => {
                      const price = statusData.data.price;
                      const hasEnoughBalance = checkBalanceSufficient(price);
                      const isDisabled = isProcessing || buyLoading || openLoading || showOpeningAnimation || (!hasEnoughBalance && paymentMethod === 'balance');

                      return (
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <button
                            onClick={handleBuyCase}
                            disabled={isDisabled}
                            className={`px-6 py-2 text-white rounded transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap ${
                              !hasEnoughBalance && paymentMethod === 'balance'
                                ? 'bg-red-600 hover:bg-red-700 border-2 border-red-400 shadow-lg shadow-red-500/30 animate-pulse'
                                : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                            }`}
                            title={!hasEnoughBalance && paymentMethod === 'balance' ? `Недостаточно средств! Требуется: ${price}₽, доступно: ${userData?.balance || 0}₽` : ''}
                          >
                            {isProcessing || buyLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t('case_preview_modal.buying')}</span>
                              </>
                            ) : !hasEnoughBalance && paymentMethod === 'balance' ? (
                              <>
                                <span className="text-red-100">💳 Недостаточно средств</span>
                                <Monetary value={price} />
                              </>
                            ) : (
                              <>
                                <span>{t('case_preview_modal.buy_and_open')}</span>
                                <Monetary value={price} />
                              </>
                            )}
                          </button>
                          {!hasEnoughBalance && paymentMethod === 'balance' && (
                            <div className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-500/30">
                              ⚠️ Не хватает {price - (userData?.balance || 0)}₽
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {statusData.data.canOpen && (
                      <button
                        onClick={() => handleOpenCase()}
                        disabled={isProcessing || buyLoading || openLoading || showOpeningAnimation}
                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                      >
                        {isProcessing || openLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('case_preview_modal.opening')}</span>
                          </>
                        ) : (
                          <span>{t('case_preview_modal.open_case')}</span>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  // Показываем кнопку по умолчанию, если статус не загружен
                  <button
                    onClick={handleBuyCase}
                    disabled={buyLoading || openLoading || showOpeningAnimation}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                  >
                    {isProcessing || buyLoading || openLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('case_preview_modal.opening')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('case_preview_modal.open_case')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasePreviewModal;
