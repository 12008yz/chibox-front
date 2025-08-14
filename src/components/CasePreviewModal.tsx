import React, { useMemo, useState, useEffect } from 'react';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../features/cases/casesApi';
import { CaseTemplate } from '../types/api';
import Monetary from './Monetary';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'bank_card'>('balance');

  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [openingResult, setOpeningResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle');

  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(
    caseData.id,
    { skip: !isOpen }
  );

  const { data: statusData, isLoading: statusLoading } = useGetCaseStatusQuery(
    caseData.id,
    { skip: !isOpen }
  );

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

    // Находим индекс выигранного предмета
    const wonItemIndex = items.findIndex(item => item.id === wonItem.id);
    const targetIndex = wonItemIndex !== -1 ? wonItemIndex : 0;

    // Сбрасываем позицию в начало
    setSliderPosition(0);

    // Настройки анимации
    let currentPosition = 0;
    let initialSpeed = 150; // начальная скорость
    let currentSpeed = initialSpeed;

    // Рассчитываем расстояние до цели
    const distance = targetIndex;
    const slowDownStart = Math.max(0, distance - 7); // начинаем замедляться за 7 шагов до цели

    const animateSlider = () => {
      // Если дошли до цели - останавливаемся
      if (currentPosition >= targetIndex) {
        setAnimationPhase('stopped');
        setTimeout(() => {
          handleAnimationComplete();
        }, 3000); // показываем результат 3 секунды
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

  if (!isVisible) return null;

  const items = itemsData?.data?.items || [];

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
        <div className="flex-1 p-6 overflow-y-auto relative" style={{ maxHeight: 'calc(90vh - 200px)' }}>
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
              {/* Сетка предметов с анимацией масштабирования */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 transition-all duration-1000 ${
                  showOpeningAnimation ? 'transform scale-75 origin-top -mt-3' : ''
                }`}
              >
                {items.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className={`bg-gray-800 rounded-lg p-2 border-2 relative transition-all duration-300 ${getRarityColor(item.rarity)} ${
                      !showOpeningAnimation ? 'hover:scale-105 animate-fade-in-up' : ''
                    } ${
                      showOpeningAnimation && sliderPosition === index
                        ? 'ring-4 ring-yellow-400 ring-opacity-100 shadow-2xl shadow-yellow-400/75 scale-125 z-10 border-yellow-400'
                        : ''
                    } ${
                      animationPhase === 'stopped' && openingResult && openingResult.item.id === item.id
                        ? 'ring-6 ring-green-400 ring-opacity-100 shadow-2xl shadow-green-400/90 scale-150 z-20 border-green-400'
                        : ''
                    }`}
                    style={{
                      animationDelay: !showOpeningAnimation ? `${index * 50}ms` : '0ms',
                      boxShadow: showOpeningAnimation && sliderPosition === index
                        ? '0 0 30px rgba(255, 193, 7, 0.8), inset 0 0 20px rgba(255, 193, 7, 0.3)'
                        : animationPhase === 'stopped' && openingResult && openingResult.item.id === item.id
                          ? '0 0 40px rgba(34, 197, 94, 0.9), inset 0 0 25px rgba(34, 197, 94, 0.4)'
                          : 'none'
                    }}
                  >
                    <div className="aspect-square mb-2 bg-gray-900 rounded flex items-center justify-center overflow-hidden relative">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
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
                              errorDiv.className = 'text-gray-500 text-xs text-center absolute inset-0 flex items-center justify-center';
                              errorDiv.textContent = 'Нет изображения';
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                      ) : (
                        <div className="text-gray-500 text-xs text-center absolute inset-0 flex items-center justify-center">
                          Нет изображения
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

                      {item.drop_weight && !showOpeningAnimation && (
                        <p className="text-gray-400 text-xs mt-1">
                          Шанс: {item.drop_weight}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Статус анимации поверх предметов (только текст, без перекрытия) */}
              {showOpeningAnimation && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="text-center text-white bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-yellow-400/50">
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
                        <div className="text-2xl font-bold mb-2">🎉 Поздравляем!</div>
                        <div className="text-lg text-green-400 font-bold">{openingResult.item.name}</div>
                        <div className="text-md mb-3">
                          <Monetary value={parseFloat(openingResult.item.price || '0')} />
                        </div>
                        <button
                          onClick={handleAnimationComplete}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
                        >
                          ✨ Забрать предмет ✨
                        </button>
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
                        <Monetary value={parseFloat(caseData.price)} />
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
