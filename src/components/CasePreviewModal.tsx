import React, { useMemo, useState, useEffect } from 'react';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../features/cases/casesApi';
import { CaseTemplate } from '../types/api';
import Monetary from './Monetary';
import CaseOpeningAnimation from './CaseOpeningAnimation';

interface CasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseTemplate;
  onBuyAndOpenCase?: (caseTemplate: CaseTemplate) => Promise<void>;
  fixedPrices?: boolean;
}

const CasePreviewModal: React.FC<CasePreviewModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onBuyAndOpenCase,
  fixedPrices = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Добавим дебаг информацию
  console.log('CasePreviewModal props:', {
    isOpen,
    fixedPrices,
    onBuyAndOpenCase: !!onBuyAndOpenCase,
    caseDataName: caseData?.name
  });
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

  // Добавим дебаг для statusData
  console.log('Status data:', { statusData, statusLoading, fixedPrices });

  const [buyCase, { isLoading: buyLoading }] = useBuyCaseMutation();
  const [openCase, { isLoading: openLoading }] = useOpenCaseMutation();

  // Добавим дебаг для мутаций
  console.log('Mutation states:', { buyLoading, openLoading });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Небольшая задержка для запуска анимации после рендера
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Скрываем модалку после завершения анимации закрытия
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleBuyCase = async () => {
    // Если есть внешний обработчик, используем его
    if (onBuyAndOpenCase) {
      try {
        await onBuyAndOpenCase(caseData);
        handleClose(); // Закрываем модалку после запуска анимации
      } catch (error) {
        console.error('Ошибка покупки кейса:', error);
      }
      return;
    }

    // Иначе используем внутреннюю логику
    try {
      const result = await buyCase({
        case_template_id: caseData.id
      }).unwrap();

      if (result.success) {
        // После покупки сразу открываем кейс
        handleOpenCase();
      }
    } catch (error) {
      console.error('Ошибка покупки кейса:', error);
    }
  };

  const handleOpenCase = async () => {
    try {
      const result = await openCase({
        case_id: caseData.id
      }).unwrap();

      if (result.success && result.data?.item) {
        setOpeningResult(result.data);
        startAnimation(result.data.item);
      }
    } catch (error) {
      console.error('Ошибка открытия кейса:', error);
    }
  };

  const startAnimation = (wonItem: any) => {
    setShowOpeningAnimation(true);
    setAnimationPhase('spinning');

    // Находим индекс выигранного предмета
    const wonItemIndex = items.findIndex(item => item.id === wonItem.id);
    const targetIndex = wonItemIndex !== -1 ? wonItemIndex : 0;

    // Анимация ползунка
    let currentPosition = 0;
    let speed = 50; // начальная скорость (мс между перемещениями)
    let direction = 1;
    let rounds = 0;
    const maxRounds = 2; // количество полных кругов перед замедлением

    const animateSlider = () => {
      if (animationPhase === 'spinning') {
        currentPosition += direction;

        // Если дошли до конца, начинаем сначала
        if (currentPosition >= items.length) {
          currentPosition = 0;
          rounds++;
        }

        setSliderPosition(currentPosition);

        // После 2 кругов начинаем замедляться к выигранному предмету
        if (rounds >= maxRounds) {
          setAnimationPhase('slowing');
          speed = 100; // замедляем
        }

        setTimeout(animateSlider, speed);
      } else if (animationPhase === 'slowing') {
        currentPosition += direction;

        if (currentPosition >= items.length) {
          currentPosition = 0;
        }

        setSliderPosition(currentPosition);

        // Увеличиваем задержку для замедления
        speed += 20;

        // Если достигли целевого предмета и скорость достаточно медленная
        if (currentPosition === targetIndex && speed > 400) {
          setAnimationPhase('stopped');
          setTimeout(() => {
            handleAnimationComplete();
          }, 2000); // показываем результат 2 секунды
        } else {
          setTimeout(animateSlider, speed);
        }
      }
    };

    animateSlider();
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
        className={`bg-[#1a1629] rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ${
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] relative">
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
                className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 transition-all duration-1000 ${
                  showOpeningAnimation ? 'transform scale-50 origin-center' : ''
                }`}
              >
                {items.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className={`bg-gray-800 rounded-lg p-2 border-2 relative ${getRarityColor(item.rarity)} ${
                      !showOpeningAnimation ? 'hover:scale-105 transition-all duration-300 animate-fade-in-up' : ''
                    } ${
                      showOpeningAnimation && sliderPosition === index
                        ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/50 scale-110 z-10'
                        : ''
                    } ${
                      animationPhase === 'stopped' && openingResult && openingResult.item.id === item.id
                        ? 'ring-4 ring-green-400 ring-opacity-100 shadow-2xl shadow-green-400/75 scale-125 z-20'
                        : ''
                    }`}
                    style={{
                      animationDelay: !showOpeningAnimation ? `${index * 50}ms` : '0ms',
                      transition: showOpeningAnimation
                        ? 'all 0.3s ease-in-out'
                        : 'all 0.3s ease-in-out'
                    }}
                  >
                    <div className="aspect-square mb-2 bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-500 text-xs text-center">
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

              {/* Overlay для блокировки нажатий во время анимации */}
              {showOpeningAnimation && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    {animationPhase === 'spinning' && (
                      <div>
                        <div className="text-2xl font-bold mb-2">🎰 Крутим барабан...</div>
                        <div className="text-lg">Определяем ваш выигрыш!</div>
                      </div>
                    )}
                    {animationPhase === 'slowing' && (
                      <div>
                        <div className="text-2xl font-bold mb-2">⏳ Замедляемся...</div>
                        <div className="text-lg">Почти готово!</div>
                      </div>
                    )}
                    {animationPhase === 'stopped' && openingResult && (
                      <div>
                        <div className="text-3xl font-bold mb-4">🎉 Поздравляем!</div>
                        <div className="text-xl mb-2">Вы выиграли:</div>
                        <div className="text-2xl font-bold text-green-400">{openingResult.item.name}</div>
                        <div className="text-lg mt-2">
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
        <div className="p-6 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {statusData?.data && !statusLoading && (
              <div>
                {statusData.data.reason && !statusData.data.canOpen && !statusData.data.canBuy && (
                  <span className="text-red-400">{statusData.data.reason}</span>
                )}
                {statusData.data.subscriptionRequired && (
                  <div className="mt-1">
                    Требуется подписка уровня {statusData.data.minSubscriptionTier}+
                    <br />
                    Ваш уровень: {statusData.data.userSubscriptionTier}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
            >
              Закрыть
            </button>

            {fixedPrices ? (
              // Показываем кнопку с фиксированной ценой для главной страницы
              <button
                onClick={handleBuyCase}
                disabled={buyLoading || openLoading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {buyLoading || openLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Открытие...</span>
                  </>
                ) : (
                  <>
                    <span>Открыть</span>
                    <span className="text-yellow-400 font-bold">
                      {caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум')
                        ? '499₽'
                        : '99₽'
                      }
                    </span>
                  </>
                )}
              </button>
            ) : (
              // Используем обычную логику для страницы профиля
              <>
                {statusData?.data && !statusLoading ? (
                  <>
                    {statusData.data.canBuy && statusData.data.price > 0 && (
                      <button
                        onClick={handleBuyCase}
                        disabled={buyLoading || openLoading}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                        onClick={handleOpenCase}
                        disabled={buyLoading || openLoading}
                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                    disabled={buyLoading || openLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Анимация открытия кейса */}
      {showOpeningAnimation && openingResult && (
        <CaseOpeningAnimation
          isOpen={showOpeningAnimation}
          onClose={handleAnimationComplete}
          caseTemplate={caseData}
          wonItem={openingResult.item}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default CasePreviewModal;
