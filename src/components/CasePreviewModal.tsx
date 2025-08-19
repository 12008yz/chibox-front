import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../features/cases/casesApi';
import { useGetUserInventoryQuery, useGetUserSubscriptionQuery } from '../features/user/userApi';
import { CaseTemplate } from '../types/api';
import Monetary from './Monetary';
import { useUserData } from '../hooks/useUserData';

interface CasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseTemplate;
  onBuyAndOpenCase?: (caseTemplate: CaseTemplate) => Promise<any>;
  fixedPrices?: boolean;
  onDataUpdate?: () => void;
}

const CasePreviewModal: React.FC<CasePreviewModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onBuyAndOpenCase,
  fixedPrices = false,
  onDataUpdate
}) => {
  const navigate = useNavigate();

  // Получаем данные пользователя для учета бонусов (должно быть в начале)
  const { userData } = useUserData();

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
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'bank_card'>('balance');

  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [openingResult, setOpeningResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle');

  // Ref для контейнера со скроллом
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(
    caseData.id,
    { skip: !isOpen }
  );

  const { data: statusData, isLoading: statusLoading } = useGetCaseStatusQuery(
    caseData.id,
    { skip: !isOpen }
  );

  // Получаем информацию о подписке пользователя
  const { data: subscriptionData } = useGetUserSubscriptionQuery(undefined, { skip: !isOpen });

  // Получаем инвентарь для определения уже выигранных предметов
  // const { data: inventoryData } = useGetUserInventoryQuery(
  //   { page: 1, limit: 1000, status: 'inventory' },
  //   { skip: !isOpen }
  // );

  const [buyCase, { isLoading: buyLoading }] = useBuyCaseMutation();
  const [openCase, { isLoading: openLoading }] = useOpenCaseMutation();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Сбрасываем состояние анимации
      setSliderPosition(0);
      setAnimationPhase('idle');
      setShowOpeningAnimation(false);
      setOpeningResult(null);
      // Блокируем скролл основной страницы
      document.body.style.overflow = 'hidden';
      // Небольшая задержка для запуска анимации после рендера
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Возвращаем скролл основной страницы
      document.body.style.overflow = 'unset';
      // Скрываем модалку после завершения анимации закрытия
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      // Восстанавливаем скролл при размонтировании
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Автоматический скроллинг за выделенным предметом
  useEffect(() => {
    if (!showOpeningAnimation || !scrollContainerRef.current) {
      return;
    }

    // Небольшая задержка для более плавной анимации
    const scrollTimeout = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const items = container.querySelectorAll('[data-item-index]');
      const currentItem = items[sliderPosition] as HTMLElement;

      if (currentItem) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = currentItem.getBoundingClientRect();

        // Вычисляем позицию элемента относительно контейнера
        const itemTop = itemRect.top - containerRect.top + container.scrollTop;
        const containerHeight = container.clientHeight;

        // Определяем целевую позицию скролла (центрируем элемент с небольшим смещением вверх)
        const targetScrollTop = itemTop - (containerHeight / 2) + (itemRect.height / 2) - 50;

        // Проверяем, виден ли элемент
        const itemTopRelative = itemRect.top - containerRect.top;
        const itemBottomRelative = itemRect.bottom - containerRect.top;
        const isVisible = itemTopRelative >= 0 && itemBottomRelative <= containerHeight;

        // Скроллим только если элемент не виден или находится слишком близко к краям
        if (!isVisible || itemTopRelative < 100 || itemBottomRelative > containerHeight - 100) {
          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
        }
      }
    }, animationPhase === 'spinning' ? 50 : 100); // Быстрее во время быстрой фазы

    return () => clearTimeout(scrollTimeout);
  }, [sliderPosition, showOpeningAnimation, animationPhase]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleBuyCase = async () => {
    console.log('handleBuyCase вызван:', { fixedPrices, paymentMethod, onBuyAndOpenCase: !!onBuyAndOpenCase });

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
    try {
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
      alert('Ошибка покупки кейса: ' + (error?.message || 'Неизвестная ошибка'));
    }
  };

  const handleOpenCase = async (caseId?: string, inventoryItemId?: string) => {
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
    }
  };

  const startAnimation = (wonItem: any) => {
    setShowOpeningAnimation(true);
    setAnimationPhase('spinning');

    // Создаем отфильтрованный список предметов БЕЗ исключенных для анимации
    const nonExcludedItems = itemsWithAdjustedChances.filter(item => !item.isExcluded);

    // Находим индекс выигранного предмета в отфильтрованном списке
    const wonItemIndex = nonExcludedItems.findIndex(item => item.id === wonItem.id);
    const targetIndex = wonItemIndex !== -1 ? wonItemIndex : 0;

    // Дополнительная проверка - выигранный предмет НЕ должен быть исключен
    const targetItem = nonExcludedItems[targetIndex];
    if (!targetItem) {
      console.error('Не удалось найти целевой предмет среди неисключенных предметов');
      return;
    }

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
    let currentPosition = 0;
    let initialSpeed = 150; // начальная скорость
    let currentSpeed = initialSpeed;

    // Рассчитываем расстояние до цели в неисключенном списке
    const distance = targetIndex;
    const slowDownStart = Math.max(0, distance - 7); // начинаем замедляться за 7 шагов до цели

    const animateSlider = () => {
      // Если дошли до цели - останавливаемся
      if (currentPosition >= targetIndex) {
        setAnimationPhase('stopped');
        setTimeout(() => {
          handleAnimationComplete();
        }, 1500); // показываем результат 1.5 секунды
        return;
      }

      // Двигаемся на следующую позицию
      currentPosition++;
      setSliderPosition(currentPosition);

      // Если еще не дошли до зоны замедления - быстро крутим
      if (currentPosition <= slowDownStart) {
        setAnimationPhase('spinning');
        currentSpeed = initialSpeed;
      } else {
        // Начинаем замедляться
        setAnimationPhase('slowing');
        const stepsLeft = targetIndex - currentPosition;
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
  };

  const handleAnimationComplete = () => {
    setShowOpeningAnimation(false);
    setOpeningResult(null);
    setAnimationPhase('idle');
    setSliderPosition(0);
    // Не закрываем модалку сразу, пусть пользователь сам закроет
  };

  // Дефолтные изображения кейсов CS2
  const defaultCaseImages = [
    'https://bitskins.com/blog/content/images/2023/12/what_cs2_cases_have_knives--2-.jpg',
    'https://bitskins.com/blog/content/images/2024/04/cheapest-cs2-cases.jpg',
    'https://cs2pulse.com/wp-content/uploads/2023/11/CS2-Case-Opening-Guide-6.png',
    'https://skinsmonkey.com/blog/wp-content/uploads/sites/2/htgcs2c.jpg',
    'https://files.bo3.gg/uploads/image/28483/image/webp-3fbd14fff1cf0a506fba0427d5ab423c.webp',
    'https://egamersworld.com/cdn-cgi/image/width=690,quality=75,format=webp/uploads/blog/z/zh/zhnsdbzy0n_1743504605002.webp'
  ];

  // Выбираем случайное изображение кейса на основе названия для стабильности
  const defaultCaseImage = useMemo(() => {
    const hash = caseData.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return defaultCaseImages[Math.abs(hash) % defaultCaseImages.length];
  }, [caseData.name]);

  const items = itemsData?.data?.items || [];

  // Функция для расчета правильного веса предмета на основе его цены (по логике dropWeightCalculator.js)
  const calculateCorrectWeightByPrice = (price: number) => {
    price = parseFloat(String(price)) || 0;

    // Система весов на основе цены для создания правильного распределения
    if (price >= 50000) return 0.005;     // 0.5% - легендарные
    if (price >= 30000) return 0.008;     // 0.8% - мифические
    if (price >= 20000) return 0.015;     // 1.5% - эпические
    if (price >= 15000) return 0.025;     // 2.5% - очень редкие
    if (price >= 10000) return 0.04;      // 4% - редкие
    if (price >= 8000) return 0.06;       // 6% - необычные+
    if (price >= 5000) return 0.1;        // 10% - необычные
    if (price >= 3000) return 0.2;        // 20% - обычные+
    if (price >= 1000) return 0.35;       // 35% - обычные
    if (price >= 500) return 0.5;         // 50% - частые
    if (price >= 100) return 0.7;         // 70% - очень частые
    return 1.0;                           // 100% - базовые/дешевые
  };

  // Получаем бонус пользователя
  const userDropBonus = userData?.total_drop_bonus_percentage || 0;

  // Определяем, является ли пользователь "Статус++" (предположительно subscription_tier >= 3)
  const isStatusPlusPlus = (subscriptionData?.data?.subscription_tier || 0) >= 3;

  // Теперь используем данные от API для определения исключённых предметов
  const itemsWithAdjustedChances = useMemo(() => {
    if (!items || items.length === 0) return [];

    // Теперь просто используем данные от сервера, который уже рассчитал всё
    const processedItems = items.map(item => ({
      ...item,
      // Используем данные от сервера о том, исключён ли предмет
      isExcluded: item.is_excluded || false,
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
      console.log('🚫 Исключенные предметы (уже получены):', excludedItems.map(item => ({
        id: item.id,
        name: item.name,
        isExcluded: item.isExcluded,
        isAlreadyDropped: item.is_already_dropped
      })));
    }

    return processedItems;
  }, [items]);

  if (!isVisible) return null;

  // Определяем изображение кейса
  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? caseData.image_url
    : defaultCaseImage;

  // Функция для определения цвета редкости
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'mil-spec':
      case 'consumer':
        return 'text-blue-400 border-blue-400';
      case 'restricted':
        return 'text-purple-400 border-purple-400';
      case 'classified':
        return 'text-pink-400 border-pink-400';
      case 'covert':
        return 'text-red-400 border-red-400';
      case 'special':
      case 'extraordinary':
        return 'text-yellow-400 border-yellow-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

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
          isAnimating && !showOpeningAnimation
            ? 'scale-100 opacity-100 translate-y-0'
            : showOpeningAnimation
              ? 'scale-95 opacity-100 translate-y-0' // минимальное отдаление при анимации
              : 'scale-75 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок модального окна */}
        <div className={`flex justify-between items-center p-6 border-b border-gray-700 transition-all duration-1000 ${
          showOpeningAnimation ? 'scale-85 opacity-80' : ''
        }`}>
          <div className="flex items-center space-x-4">
            <img
              src={caseImageUrl}
              alt={caseData.name}
              className={`object-cover rounded transition-all duration-1000 ${
                showOpeningAnimation ? 'w-12 h-12' : 'w-16 h-16'
              }`}
            />
            <div>
              <h2 className={`font-bold text-white transition-all duration-1000 ${
                showOpeningAnimation ? 'text-xl' : 'text-2xl'
              }`}>{caseData.name}</h2>
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
                    <span>Бесплатный кейс</span>
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
              <p className="text-white ml-4">Загрузка предметов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Ошибка загрузки предметов</p>
            </div>
          ) : items.length > 0 ? (
            <div className="relative">
              {/* Отладочная информация о пользователе */}
              {!showOpeningAnimation && (
                <div className="mb-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                  <div className="text-xs text-gray-300">
                    <p><strong>DEBUG INFO:</strong></p>
                    <p>Пользователь ID: {userData?.id || 'не найден'}</p>
                    <p>Кейс ID: {caseData.id}</p>
                    <p>Уровень подписки: {subscriptionData?.data?.subscription_tier || 'не определен'}</p>
                    <p>Статус++: {isStatusPlusPlus ? 'ДА' : 'НЕТ'}</p>
                    <p>Исключенных предметов: {itemsWithAdjustedChances.filter(item => item.isExcluded).length}</p>
                    <p>Всего предметов: {itemsWithAdjustedChances.length}</p>
                    <p>Предметы already_dropped: {itemsWithAdjustedChances.filter(item => item.is_already_dropped).length}</p>
                    {itemsWithAdjustedChances.filter(item => item.isExcluded).length > 0 && (
                      <div className="mt-2">
                        <p><strong>Исключенные предметы:</strong></p>
                        {itemsWithAdjustedChances.filter(item => item.isExcluded).slice(0, 3).map((item, index) => (
                          <p key={index} className="text-red-400">- {item.name}</p>
                        ))}
                        {itemsWithAdjustedChances.filter(item => item.isExcluded).length > 3 && (
                          <p className="text-red-400">... и еще {itemsWithAdjustedChances.filter(item => item.isExcluded).length - 3}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Информационное сообщение для "Статус++" пользователей */}
              {isStatusPlusPlus && itemsWithAdjustedChances.some(item => item.isExcluded) && !showOpeningAnimation && (
                <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-400">👑</div>
                    <div className="text-sm text-blue-300">
                      <strong>Преимущество Статус++:</strong> Перечеркнутые предметы вы уже получали из этого кейса и они исключены из выпадения.
                    </div>
                  </div>
                </div>
              )}

              {/* Сетка предметов с анимацией масштабирования */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 transition-all duration-1000 ${
                  showOpeningAnimation ? 'transform scale-75 origin-top -mt-3' : ''
                }`}
              >
                {itemsWithAdjustedChances.map((item: any, index: number) => {
                  // Для Статус++ пользователей во время анимации скрываем исключенные предметы
                  if (showOpeningAnimation && isStatusPlusPlus && item.isExcluded) {
                    return null;
                  }

                  // Для анимации нужно пересчитать индекс без учета исключенных предметов
                  const nonExcludedItems = showOpeningAnimation && isStatusPlusPlus
                    ? itemsWithAdjustedChances.filter(item => !item.isExcluded)
                    : itemsWithAdjustedChances;

                  const animationIndex = showOpeningAnimation && isStatusPlusPlus
                    ? nonExcludedItems.findIndex(nonExcludedItem => nonExcludedItem.id === item.id)
                    : index;

                  const isCurrentSliderPosition = showOpeningAnimation && sliderPosition === animationIndex;
                  const isWinningItem = animationPhase === 'stopped' && openingResult && openingResult.item.id === item.id;

                  return (
                    <div
                      key={item.id || index}
                      data-item-index={animationIndex}
                      className={`bg-gray-800 rounded-lg p-2 border-2 relative transition-all duration-300 ${getRarityColor(item.rarity)} ${
                        !showOpeningAnimation ? 'hover:scale-105 animate-fade-in-up' : ''
                      } ${
                        isCurrentSliderPosition
                          ? 'ring-4 ring-yellow-400 ring-opacity-100 shadow-2xl shadow-yellow-400/75 scale-125 z-10 border-yellow-400'
                          : ''
                      } ${
                        isWinningItem
                          ? 'ring-6 ring-green-400 ring-opacity-100 shadow-2xl shadow-green-400/90 scale-150 z-20 border-green-400'
                          : ''
                      } ${
                        item.isExcluded ? 'opacity-50 grayscale' : ''
                      }`}
                      style={{
                        animationDelay: !showOpeningAnimation ? `${index * 50}ms` : '0ms',
                        boxShadow: isCurrentSliderPosition
                          ? '0 0 30px rgba(255, 193, 7, 0.8), inset 0 0 20px rgba(255, 193, 7, 0.3)'
                          : isWinningItem
                            ? '0 0 40px rgba(34, 197, 94, 0.9), inset 0 0 25px rgba(34, 197, 94, 0.4)'
                            : 'none'
                      }}
                    >
                      <div className="aspect-square mb-2 bg-gray-900 rounded flex items-center justify-center relative">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className={`max-w-full max-h-full object-contain relative z-0 ${item.isExcluded ? 'opacity-70' : ''}`}
                            style={{
                              backgroundColor: 'rgba(17, 24, 39, 0.8)',
                              mixBlendMode: 'normal'
                            }}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.backgroundColor = 'transparent';
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'text-gray-500 text-xs text-center absolute inset-0 flex items-center justify-center z-0';
                                errorDiv.textContent = 'Нет изображения';
                                parent.appendChild(errorDiv);
                              }
                            }}
                          />
                        ) : (
                          <div className="text-gray-500 text-xs text-center absolute inset-0 flex items-center justify-center z-0">
                            Нет изображения
                          </div>
                        )}

                        {/* Перечеркивание для уже выигранных предметов */}
                        {item.isExcluded && (
                          <>
                            {/* Полупрозрачный оверлей */}
                            <div className="absolute inset-0 bg-black bg-opacity-40 z-20"></div>

                            {/* Перечеркивающие линии */}
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                              <div className="w-full h-1 bg-red-500 shadow-lg transform rotate-45"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                              <div className="w-full h-1 bg-red-500 shadow-lg transform -rotate-45"></div>
                            </div>

                            {/* Галочка */}
                            <div className="absolute top-1 right-1 z-40">
                              <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded shadow-lg font-bold">
                                ✓
                              </div>
                            </div>
                          </>
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
                          <div className="text-xs mt-1 z-99999">
                            {item.isExcluded ? (
                              <div>
                                <p className="text-red-400 font-bold">
                                  ✓ Уже получен
                                </p>
                                <p className="text-red-300 text-xs">
                                  DEBUG: excluded={item.isExcluded ? 'true' : 'false'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-gray-400">
                                  Шанс: {item.drop_chance_percent ? `${item.drop_chance_percent.toFixed(3)}%` : '0%'}
                                  {item.bonusApplied > 0 && parseFloat(item.price || '0') >= 100 && (
                                    <span className="text-yellow-400 ml-1">
                                      (+{(item.bonusApplied * 100).toFixed(1)}% бонус)
                                    </span>
                                  )}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  DEBUG: excluded={item.isExcluded ? 'true' : 'false'}, dropped={item.is_already_dropped ? 'true' : 'false'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Статус анимации поверх предметов (только текст, без перекрытия) */}
              {showOpeningAnimation && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                  <div className="text-center text-white bg-black/90 backdrop-blur-md rounded-lg px-8 py-4 border-2 border-yellow-400/70 shadow-2xl shadow-yellow-400/30">
                    {animationPhase === 'spinning' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg font-bold">🎰 Выбираем предмет...</span>
                      </div>
                    )}
                    {animationPhase === 'slowing' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                        <span className="text-lg font-bold">⏳ Определяем результат...</span>
                      </div>
                    )}
                    {animationPhase === 'stopped' && openingResult && (
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">🎉 Выпал предмет!</div>
                        <div className="text-lg text-green-400 font-bold">{openingResult.item.name}</div>
                        <div className="text-md">
                          <Monetary value={parseFloat(openingResult.item.price || '0')} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Предметы не найдены</p>
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className={`flex-shrink-0 p-6 border-t border-gray-700 bg-[#1a1629] transition-all duration-1000 ${
          showOpeningAnimation ? 'scale-85 opacity-70' : ''
        }`}>
          <div className="text-sm text-gray-400 mb-4">
            {statusData?.data && !statusLoading && (
              <div>
                {statusData.data.reason && !statusData.data.canOpen && !statusData.data.canBuy && (
                  <span className="text-red-400">{statusData.data.reason}</span>
                )}
                {statusData.data.subscriptionRequired && (
                  <div className="mt-1">
                    Требуется статус уровня {statusData.data.minSubscriptionTier}+
                    <br />
                    Ваш уровень: {statusData.data.userSubscriptionTier}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
              disabled={showOpeningAnimation}
            >
              Закрыть
            </button>

            {fixedPrices ? (
              // Показываем кнопки с выбором метода оплаты для премиум кейсов
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* Селектор метода оплаты */}
                {!showOpeningAnimation && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-400 whitespace-nowrap">Оплата:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'balance' | 'bank_card')}
                      className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="balance">Баланс</option>
                      <option value="bank_card">Банковская карта</option>
                    </select>
                  </div>
                )}

                {/* Кнопка покупки */}
                <button
                  onClick={handleBuyCase}
                  disabled={buyLoading || openLoading || showOpeningAnimation}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                >
                  {buyLoading || openLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{paymentMethod === 'bank_card' ? 'Переход к оплате...' : 'Открытие...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === 'bank_card' ? 'Купить' : 'Открыть'}</span>
                      <span className="text-yellow-400 font-bold">
                        {caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум')
                          ? '499₽'
                          : '99₽'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Используем обычную логику для страницы профиля
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {statusData?.data && !statusLoading ? (
                  <>
                    {statusData.data.canBuy && statusData.data.price > 0 && (
                      <button
                        onClick={handleBuyCase}
                        disabled={buyLoading || openLoading || showOpeningAnimation}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                      >
                        {buyLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Покупка...</span>
                          </>
                        ) : (
                          <>
                            <span>Купить и открыть</span>
                            <Monetary value={statusData.data.price} />
                          </>
                        )}
                      </button>
                    )}

                    {statusData.data.canOpen && (
                      <button
                        onClick={() => handleOpenCase()}
                        disabled={buyLoading || openLoading || showOpeningAnimation}
                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                      >
                        {openLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Открытие...</span>
                          </>
                        ) : (
                          <span>Открыть кейс</span>
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
                    {buyLoading || openLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Открытие...</span>
                      </>
                    ) : (
                      <>
                        <span>Открыть кейс</span>
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
