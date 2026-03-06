import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { throttle } from 'lodash-es';
import toast from 'react-hot-toast';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../../features/cases/casesApi';
import { useBuySubscriptionMutation } from '../../features/subscriptions/subscriptionsApi';
import { CaseTemplate } from '../../types/api';
import { useUserData } from '../../hooks/useUserData';
import { CaseItem } from './components/CaseItem';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import ItemInfoModal from './components/ItemInfoModal';
import { CasePreviewModalProps } from './types';
import { getRarityColor, generateGoldenSparks, getDefaultCaseImage } from './utils';
import { injectStyles } from './styles';
import { getCaseImageUrl, getItemImageUrl, adaptImageSize, preloadItemImages } from '../../utils/steamImageUtils';
import { getApiErrorMessage } from '../../utils/config';
import { soundManager } from '../../utils/soundManager';

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
  const { userData } = useUserData();

  const paymentMethod = 'balance' as const; // Всегда используем только баланс
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [openingResult, setOpeningResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'fake-slowing' | 'speeding-up' | 'wobbling' | 'falling' | 'stopped'>('idle');
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [showGoldenSparks, setShowGoldenSparks] = useState(false);
  const [_shouldFakeSlowdown, setShouldFakeSlowdown] = useState(false);
  const [_shouldStopBetween, setShouldStopBetween] = useState(false);
  const [sliderOffset, setSliderOffset] = useState(0);
  const [showWinEffects, setShowWinEffects] = useState(false);
  const [showItemInfoModal, setShowItemInfoModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDropChance, setShowDropChance] = useState(false);
  // На мобильных: 24 предмета в анимации (полоска + результат)
  const [mobileAnimationItems, setMobileAnimationItems] = useState<any[]>([]);
  const MOBILE_STRIP_SIZE = 24;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationTimoutsRef = useRef<NodeJS.Timeout[]>([]); // Массив всех таймаутов анимации
  const animationIntervalsRef = useRef<NodeJS.Timeout[]>([]); // Массив всех интервалов анимации
  const scrollLockRef = useRef<number | null>(null); // Позиция скролла при открытии модалки (для восстановления)
  // Мобильная оптимизация: позиция полоски через ref, без лишних re-render на каждый шаг
  const mobileStripRef = useRef<HTMLDivElement>(null);
  const mobileAnimationRef = useRef<{ position: number; offset: number }>({ position: 0, offset: 0 });
  // Шаг полоски: mobile 100px+12px=112, sm 112px+12px=124 (совпадает с w-[100px]/sm:w-[112px] + gap-3)
  const getMobileStepPx = () => (typeof window !== 'undefined' && window.innerWidth >= 640 ? 124 : 112);

  // Мобильная/планшетная версия: горизонтальный скролл + центральный квадрат (breakpoint lg 1024px)
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  useEffect(() => {
    const check = () => setIsMobileOrTablet(window.innerWidth < 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(caseData.id, { skip: !isOpen });
  const { data: statusData, isLoading: statusLoading, refetch: refetchCaseStatus } = useGetCaseStatusQuery(caseData.id, { skip: !isOpen });
  const [buyCase, { isLoading: buyLoading }] = useBuyCaseMutation();

  // Всегда подтягивать свежий статус при открытии модалки (подписка могла измениться — покупка или выдача через скрипт)
  useEffect(() => {
    if (isOpen && caseData?.id) refetchCaseStatus();
  }, [isOpen, caseData?.id, refetchCaseStatus]);

  // Предзагрузка изображений предметов при открытии модалки — чтобы на iPhone картинки успевали прогрузиться до анимации
  useEffect(() => {
    if (!isOpen || !itemsData?.data?.items?.length) return;
    const urls = itemsData.data.items.map((item) => item.image_url);
    preloadItemImages(urls);
  }, [isOpen, itemsData?.data?.items]);

  // Мобильная полоска: начальная позиция при старте анимации (ref может быть уже смонтирован)
  useEffect(() => {
    if (showOpeningAnimation && isMobileOrTablet && mobileStripRef.current) {
      mobileStripRef.current.style.transform = 'translate3d(0,0,0)';
      mobileStripRef.current.style.webkitTransform = 'translate3d(0,0,0)';
    }
  }, [showOpeningAnimation, isMobileOrTablet]);

  // Звук взрыва на мобильной теперь в trackTimeout вместе с setShowWinEffects (как на десктопе)
  const [openCase, { isLoading: openLoading }] = useOpenCaseMutation();
  const [buySubscription, { isLoading: buySubscriptionLoading }] = useBuySubscriptionMutation();

  // Функция для получения цены кейса (0 — бесплатный кейс; проверяем явно, т.к. 0 в if даёт false)
  const getCasePrice = useCallback((caseData: CaseTemplate): number => {
    if (statusData?.data != null && typeof statusData.data.price === 'number') {
      return statusData.data.price;
    }
    return caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум') ? 499 : 99;
  }, [statusData]);

  // Покупка статуса с переходом сразу на страницу оплаты (tier 1/2/3)
  const handleBuyStatusClick = useCallback(async (tier: number) => {
    try {
      const result = await buySubscription({
        tierId: tier,
        method: 'bank_card',
        paymentMethod: 'unitpay',
      }).unwrap();
      if (result?.data?.paymentUrl) {
        onClose();
        window.location.href = result.data.paymentUrl;
      } else if (result?.success) {
        toast.success('Статус активирован');
        onClose();
        if (onDataUpdate) setTimeout(() => onDataUpdate(), 100);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Ошибка при создании платежа'));
    }
  }, [buySubscription, onClose, onDataUpdate]);

  // Проверяем авторизацию пользователя
  useEffect(() => {
    if (isOpen && !userData) {
      onClose();
      navigate('/login');
    }
  }, [isOpen, userData, navigate, onClose]);

  // Обработка открытия/закрытия модала
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsProcessing(false);
      setSliderPosition(0);
      setSliderOffset(0);
      setAnimationPhase('idle');
      setShowOpeningAnimation(false);
      setOpeningResult(null);
      setShowStrikeThrough(false);
      setShowGoldenSparks(false);
      setShowWinEffects(false);
      setShouldStopBetween(false);
      // Полная блокировка скролла фона: html, body и фиксация позиции (надёжно на мобиле)
      const scrollY = window.scrollY;
      scrollLockRef.current = scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      const timer = setTimeout(() => setIsAnimating(true), 16);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setIsProcessing(false);
      setShowOpeningAnimation(false);
      setAnimationPhase('idle');
      soundManager.stopAll(); // Останавливаем все звуки при закрытии
      animationTimoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimoutsRef.current = [];
      animationIntervalsRef.current.forEach(interval => clearInterval(interval));
      animationIntervalsRef.current = [];
      // Восстановление скролла и позиции
      const savedScroll = scrollLockRef.current;
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (savedScroll !== null) {
        window.scrollTo(0, savedScroll);
        scrollLockRef.current = null;
      }
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollLockRef.current !== null) {
        window.scrollTo(0, scrollLockRef.current);
        scrollLockRef.current = null;
      }
      soundManager.stopAll(); // Останавливаем все звуки при размонтировании
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Очищаем все таймауты и интервалы анимации
      animationTimoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimoutsRef.current = [];
      animationIntervalsRef.current.forEach(interval => clearInterval(interval));
      animationIntervalsRef.current = [];
    };
  }, []);

  // Оптимизированный автоскролл с throttling (вертикальный на десктопе, горизонтальный на мобиле/планшете)
  const scrollToItem = useCallback(
    throttle((index: number) => {
      if (!scrollContainerRef.current || !showOpeningAnimation || animationPhase === 'idle') return;

      const container = scrollContainerRef.current;
      const items = container.querySelectorAll('[data-item-index]');
      const currentItem = items[index] as HTMLElement;

      if (currentItem) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();
          const itemRect = currentItem.getBoundingClientRect();

          if (isMobileOrTablet) {
            const itemLeft = itemRect.left - containerRect.left + container.scrollLeft;
            const containerWidth = container.clientWidth;
            const targetScrollLeft = itemLeft - (containerWidth / 2) + (itemRect.width / 2);
            container.scrollTo({
              left: Math.max(0, targetScrollLeft),
              behavior: animationPhase === 'spinning' ? 'auto' : 'smooth'
            });
          } else {
            const itemTop = itemRect.top - containerRect.top + container.scrollTop;
            const containerHeight = container.clientHeight;
            const targetScrollTop = itemTop - (containerHeight / 2) + (itemRect.height / 2);
            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: animationPhase === 'spinning' ? 'auto' : 'smooth'
            });
          }
        });
      }
    }, 16),
    [showOpeningAnimation, animationPhase, isMobileOrTablet]
  );

  // Автоскролл к выбранному элементу во время анимации (только десктоп; на мобиле используется transform)
  useEffect(() => {
    if (!showOpeningAnimation || animationPhase === 'idle' || isMobileOrTablet) return;
    scrollToItem(sliderPosition);
  }, [sliderPosition, showOpeningAnimation, animationPhase, scrollToItem, isMobileOrTablet]);

  // Функция для определения мобильного устройства
  const isMobileDevice = () => {
    return window.innerWidth < 768; // md breakpoint в Tailwind
  };

  // Обработчик клика на предмет для показа информации
  const handleItemClick = (item: any, withDropChance: boolean = true) => {
    if (!isMobileDevice() || showOpeningAnimation) return;

    setSelectedItem(item);
    setShowDropChance(withDropChance);
    setShowItemInfoModal(true);
  };

  const handleClose = () => {
    // Останавливаем все звуки при закрытии
    soundManager.stopAll();
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  // Предметы с исключениями
  const itemsWithAdjustedChances = useMemo(() => {
    const items = itemsData?.data?.items || [];
    if (!items || items.length === 0) return [];

    const isDailyCase = caseData.id === "44444444-4444-4444-4444-444444444444";

    return items.map(item => ({
      ...item,
      isExcluded: isDailyCase ? (item.is_excluded || false) : false,
      isAlreadyWon: item.is_already_dropped || false,
      drop_chance_percent: item.drop_chance_percent || 0,
      modifiedWeight: item.modified_weight || item.drop_weight || 0,
      weightMultiplier: item.weight_multiplier || 1,
      bonusApplied: item.bonus_applied || 0
    }));
  }, [itemsData?.data?.items, caseData.id]);

  const handleAnimationComplete = useCallback(() => {
    // Сохраняем результат открытия перед сбросом
    const wonItem = openingResult?.item;

    setShowOpeningAnimation(false);
    setAnimationPhase('idle');
    setSliderPosition(0);
    setSliderOffset(0);
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);
    setShowWinEffects(false);
    setShouldStopBetween(false);
    setIsProcessing(false);
    setMobileAnimationItems([]);

    // Останавливаем все звуки
    soundManager.stopAll();

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // Открываем модальное окно на мобильных устройствах с информацией о выпавшем предмете
    if (isMobileDevice() && wonItem) {
      setTimeout(() => {
        setSelectedItem(wonItem);
        setShowDropChance(false);
        setShowItemInfoModal(true);
      }, 500); // Небольшая задержка для плавности
    }

    // Сбрасываем результат после обработки
    setOpeningResult(null);
  }, [openingResult]);

  // Улучшенная анимация открытия с fake slowdown
  const startAnimation = useCallback((wonItem: any) => {
    // Очищаем все предыдущие таймауты и интервалы перед началом новой анимации
    animationTimoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationTimoutsRef.current = [];
    animationIntervalsRef.current.forEach(interval => clearInterval(interval));
    animationIntervalsRef.current = [];

    // Вспомогательные функции для отслеживания таймаутов и интервалов
    const trackTimeout = (callback: () => void, delay: number) => {
      const timeout = setTimeout(callback, delay);
      animationTimoutsRef.current.push(timeout);
      return timeout;
    };

    const trackInterval = (callback: () => void, delay: number) => {
      const interval = setInterval(callback, delay);
      animationIntervalsRef.current.push(interval);
      return interval;
    };

    setShowOpeningAnimation(true);
    setAnimationPhase('spinning');
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);
    setShowWinEffects(false);

    // 25% шанс на fake slowdown
    const useFakeSlowdown = Math.random() < 0.25;
    setShouldFakeSlowdown(useFakeSlowdown);

    // Убрали выбор между двумя предметами
    const useStopBetween = false;
    setShouldStopBetween(useStopBetween);

    let availableItemsForAnimation = itemsWithAdjustedChances.filter(item => !item.isExcluded);
    let wonItemIndex = availableItemsForAnimation.findIndex(item => item.id === wonItem.id);

    if (wonItemIndex === -1) {
      setAnimationPhase('stopped');
      setTimeout(() => handleAnimationComplete(), 1500);
      return;
    }

    // На мобильных: 24 предмета в полоске, выигрышный — в случайной позиции (0..23)
    if (isMobileOrTablet) {
      if (availableItemsForAnimation.length > MOBILE_STRIP_SIZE) {
        const others = availableItemsForAnimation.filter(item => item.id !== wonItem.id);
        const shuffled = [...others].sort(() => Math.random() - 0.5);
        const rest = shuffled.slice(0, MOBILE_STRIP_SIZE - 1);
        const insertAt = Math.floor(Math.random() * MOBILE_STRIP_SIZE);
        const stripItems = [...rest.slice(0, insertAt), wonItem, ...rest.slice(insertAt)];
        setMobileAnimationItems(stripItems);
        availableItemsForAnimation = stripItems;
        wonItemIndex = insertAt;
      } else {
        setMobileAnimationItems(availableItemsForAnimation);
      }
    } else {
      setMobileAnimationItems([]);
    }

    setSliderPosition(0);
    if (!isMobileOrTablet && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let currentAvailablePosition = 0;
    // На мобильных (особенно iPhone) чуть реже обновляем кадры, чтобы анимация не лагала
    const initialSpeed = isMobileOrTablet ? 100 : 80;
    let currentSpeed = initialSpeed;
    const distance = wonItemIndex;

    // Точки анимации
    const fakeSlowdownPoint = useFakeSlowdown ? Math.floor(distance * 0.4) : -1; // 40% пути
    const fakeSlowdownEnd = useFakeSlowdown ? Math.floor(distance * 0.5) : -1; // 50% пути
    const finalSlowdownStart = Math.max(0, distance - 8);

    let hasFakeSlowedDown = false;
    let hasSpedUpAgain = false;

    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);
    const easeInQuart = (t: number): number => Math.pow(t, 4);
    const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // На мобильных обновляем transform полоски через ref (без re-render), state — только для подсветки, раз в 2 шага
    let mobileStepCount = 0;
    const applyMobileStripTransform = (position: number, offset: number) => {
      mobileAnimationRef.current.position = position;
      mobileAnimationRef.current.offset = offset;
      if (mobileStripRef.current) {
        const px = -(position + offset) * getMobileStepPx();
        mobileStripRef.current.style.transform = `translate3d(${px}px,0,0)`;
        mobileStripRef.current.style.webkitTransform = `translate3d(${px}px,0,0)`;
      }
    };

    const animateSlider = () => {
      // Проверка на остановку между предметами (за 1 позицию до выигрыша)
      if (useStopBetween && currentAvailablePosition === wonItemIndex - 1) {
        const currentItemInFullList = itemsWithAdjustedChances.findIndex((_item, idx) => {
          let availableCount = 0;
          for (let i = 0; i <= idx; i++) {
            if (!itemsWithAdjustedChances[i].isExcluded) {
              if (availableCount === currentAvailablePosition) {
                return i === idx;
              }
              availableCount++;
            }
          }
          return false;
        });

        setSliderPosition(currentItemInFullList);
        if (isMobileOrTablet) mobileAnimationRef.current.position = currentItemInFullList;

        // Небольшая задержка перед началом wobbling для плавности
        trackTimeout(() => {
          setAnimationPhase('wobbling');

          // Плавное перекатывание на следующий предмет (30%) и обратно
          let rollProgress = 0;
          const rollSteps = 60; // Увеличили количество шагов для более медленной анимации
          const rollInterval = trackInterval(() => {
            rollProgress++;

            // Создаем плавную кривую: 0 -> 0.3 -> 0
            const normalizedProgress = rollProgress / rollSteps;
            let offset = 0;

            if (normalizedProgress < 0.5) {
              // Первая половина: плавно двигаемся вперед до 30%
              const forwardProgress = normalizedProgress * 2; // 0 -> 1
              // Используем ease-in-out для плавного старта и замедления в конце
              const eased = forwardProgress < 0.5
                ? 4 * forwardProgress * forwardProgress * forwardProgress
                : 1 - Math.pow(-2 * forwardProgress + 2, 3) / 2;
              offset = 0.3 * eased;
            } else {
              // Вторая половина: плавно возвращаемся назад
              const backwardProgress = (normalizedProgress - 0.5) * 2; // 0 -> 1
              // Используем ease-in-out для плавного возврата
              const eased = backwardProgress < 0.5
                ? 4 * backwardProgress * backwardProgress * backwardProgress
                : 1 - Math.pow(-2 * backwardProgress + 2, 3) / 2;
              offset = 0.3 * (1 - eased);
            }

            setSliderOffset(offset);
            if (isMobileOrTablet) applyMobileStripTransform(mobileAnimationRef.current.position, offset);

            if (rollProgress >= rollSteps) {
              clearInterval(rollInterval);
              // Удаляем интервал из массива отслеживания
              const index = animationIntervalsRef.current.indexOf(rollInterval);
              if (index > -1) {
                animationIntervalsRef.current.splice(index, 1);
              }
              setSliderOffset(0);
              setAnimationPhase('falling');

              // Быстрое падение на выигрышный предмет
              trackTimeout(() => {
                const wonItemInFullList = (isMobileOrTablet && availableItemsForAnimation.length <= MOBILE_STRIP_SIZE) ? wonItemIndex : itemsWithAdjustedChances.findIndex(item => item.id === wonItem.id);
                setSliderPosition(wonItemInFullList);
                if (isMobileOrTablet) applyMobileStripTransform(wonItemInFullList, 0);
                setAnimationPhase('stopped');

                // Эффекты выигрыша: взрыв и искры и на мобильной, как на десктопе
                trackTimeout(() => {
                  soundManager.play('endProcess');
                  setShowWinEffects(true);
                }, 300);
                trackTimeout(() => setShowGoldenSparks(true), 800);
                trackTimeout(() => {
                  if (caseData.id === "44444444-4444-4444-4444-444444444444") {
                    setShowStrikeThrough(true);
                  }
                }, 1500);
                trackTimeout(() => handleAnimationComplete(), caseData.id === '44444444-4444-4444-4444-444444444444' ? 5000 : 4000);
              }, 200);
            }
          }, 25); // 25ms между шагами (60 шагов * 25ms = 1.5 секунды)
        }, 200); // Задержка 200ms перед началом анимации

        return;
      }

      if (currentAvailablePosition >= wonItemIndex) {
        const wonItemInFullList = (isMobileOrTablet && availableItemsForAnimation.length <= MOBILE_STRIP_SIZE) ? wonItemIndex : itemsWithAdjustedChances.findIndex(item => item.id === wonItem.id);
        setSliderPosition(wonItemInFullList);
        if (isMobileOrTablet) applyMobileStripTransform(wonItemInFullList, 0);
        setAnimationPhase('stopped');

        // Эффекты выигрыша: взрыв и искры и на мобильной, как на десктопе
        trackTimeout(() => {
          soundManager.play('endProcess');
          setShowWinEffects(true);
        }, 300);
        trackTimeout(() => setShowGoldenSparks(true), 800); // Золотые искры
        trackTimeout(() => {
          if (caseData.id === "44444444-4444-4444-4444-444444444444") {
            setShowStrikeThrough(true);
          }
        }, 1500);
        trackTimeout(() => handleAnimationComplete(), caseData.id === '44444444-4444-4444-4444-444444444444' ? 5000 : 4000);
        return;
      }

      currentAvailablePosition++;
      let fullListPosition = 0;
      if (isMobileOrTablet && availableItemsForAnimation.length <= MOBILE_STRIP_SIZE) {
        // Полоска из 24 предметов: позиция = шаг анимации (0..23)
        fullListPosition = currentAvailablePosition;
      } else {
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
      }

      // Мобильные: позиция полоски через ref (без re-render), state для подсветки — раз в 2 шага
      if (isMobileOrTablet) {
        applyMobileStripTransform(fullListPosition, 0);
        if (mobileStepCount % 2 === 0) setSliderPosition(fullListPosition);
        mobileStepCount++;
      } else {
        setSliderPosition(fullListPosition);
      }

      // Воспроизводим звук при каждой смене предмета (ignoreThrottle = true для частого воспроизведения)
      soundManager.play('process', false, true);

      // Логика fake slowdown
      if (useFakeSlowdown && currentAvailablePosition >= fakeSlowdownPoint && currentAvailablePosition < fakeSlowdownEnd && !hasFakeSlowedDown) {
        setAnimationPhase('fake-slowing');
        const progress = (currentAvailablePosition - fakeSlowdownPoint) / (fakeSlowdownEnd - fakeSlowdownPoint);
        currentSpeed = initialSpeed + (400 * easeInQuart(progress)); // Резкое замедление

        if (currentAvailablePosition >= fakeSlowdownEnd - 1) {
          hasFakeSlowedDown = true;
        }
      }
      // Резкое ускорение после fake slowdown
      else if (useFakeSlowdown && hasFakeSlowedDown && !hasSpedUpAgain && currentAvailablePosition < finalSlowdownStart) {
        setAnimationPhase('speeding-up');
        const speedUpDuration = 5;
        const speedUpProgress = Math.min(1, (currentAvailablePosition - fakeSlowdownEnd) / speedUpDuration);
        currentSpeed = Math.max(initialSpeed * 0.5, 400 - (350 * easeOutQuart(speedUpProgress))); // Резкое ускорение

        if (speedUpProgress >= 1) {
          hasSpedUpAgain = true;
        }
      }
      // Обычное вращение
      else if (currentAvailablePosition < finalSlowdownStart) {
        setAnimationPhase('spinning');
        currentSpeed = initialSpeed;
      }
      // Финальное замедление
      else {
        setAnimationPhase('slowing');
        const stepsLeft = wonItemIndex - currentAvailablePosition;
        const progress = 1 - (stepsLeft / 8);
        currentSpeed = initialSpeed + (450 * easeInOutCubic(progress));
      }

      trackTimeout(animateSlider, currentSpeed);
    };

    // На мобильных даём ещё 200–300 мс на догрузку картинок после preload
    const startDelay = isMobileOrTablet ? 700 : 500;
    trackTimeout(() => {
      if (isMobileOrTablet) applyMobileStripTransform(0, 0);
      animateSlider();
    }, startDelay);
  }, [itemsWithAdjustedChances, caseData.id, handleAnimationComplete, isMobileOrTablet]);

  const handleBuyCase = async () => {
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) {
      return;
    }

    setIsProcessing(true);

    try {
      if (onBuyAndOpenCase) {
        const result = await onBuyAndOpenCase(caseData);
        if (result && result.item) {
          setOpeningResult(result);
          startAnimation(result.item);
        }
        return;
      }

      const buyParams = {
        case_template_id: caseData.id,
        caseTemplateId: caseData.id,
        method: paymentMethod,
        quantity: 1
      };

      const result = await buyCase(buyParams).unwrap();

      if (result.success) {
        if (result.data?.inventory_cases && result.data.inventory_cases.length > 0) {
          const inventoryCase = result.data.inventory_cases[0];

          // Сбрасываем isProcessing перед вызовом handleOpenCase
          setIsProcessing(false);
          await handleOpenCase(undefined, inventoryCase.id);
          return; // Возвращаемся, чтобы не сбрасывать isProcessing в finally
        } else {
          toast.success('Кейс успешно куплен!');
          handleClose();
        }
      } else {
        toast.error(result.message || 'Ошибка покупки');
      }
    } catch (error: any) {
      const msg = getApiErrorMessage(error, '');
      if (error?.status === 400 && msg.includes('Недостаточно средств')) {
        const requiredAmount = error?.data?.data?.required || 0;
        const availableAmount = error?.data?.data?.available || 0;
        const shortfall = requiredAmount - availableAmount;
        toast.error(`Недостаточно ${shortfall} ChiCoins для покупки`, {
          duration: 3000,
          icon: '💳',
        });
      } else {
        toast.error(getApiErrorMessage(error, 'Ошибка покупки кейса'), {
          duration: 3000,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCase = async (caseId?: string, inventoryItemId?: string) => {
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) {
      return;
    }

    setIsProcessing(true);

    try {
      const openCaseParams: any = {};
      if (inventoryItemId) {
        openCaseParams.inventoryItemId = inventoryItemId;
      } else if (caseId) {
        openCaseParams.case_id = caseId;
      } else {
        openCaseParams.template_id = caseData.id;
      }

      // Звук открытия кейса (не для ежедневного кейса)
      const isDailyCase = caseData.id === "44444444-4444-4444-4444-444444444444" || "11111111-1111-1111-1111-111111111111" || "22222222-2222-2222-2222-222222222222" || "33333333-3333-3333-3333-333333333333" || "55555555-5555-5555-5555-555555555555" || "66666666-6666-6666-6666-666666666666" || "77777777-7777-7777-7777-777777777777";
      if (!isDailyCase) {
        soundManager.play('openCase');
      }

      const result = await openCase(openCaseParams).unwrap();

      if (result.success && result.data?.item) {
        setOpeningResult(result.data);
        startAnimation(result.data.item);
      }
    } catch (error: any) {
      const openMsg = getApiErrorMessage(error, 'Произошла ошибка при открытии кейса');
      if (openMsg.includes('уже получали') || openMsg.includes('завтра')) {
        toast.error(openMsg || 'Кейс уже получен сегодня', {
          duration: 4000,
        });
        onClose();
        if (onDataUpdate) {
          setTimeout(() => onDataUpdate(), 100);
        }
      } else {
        toast.error(openMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? getCaseImageUrl(caseData.image_url)
    : getDefaultCaseImage(caseData.name);

  // На мобильных во время анимации: полоска из 24 предметов (или всех, если меньше)
  const itemsForMobileStrip = mobileAnimationItems.length > 0 ? mobileAnimationItems : itemsWithAdjustedChances;
  const wonItem = openingResult?.item;
  const showMobileWinReveal = showOpeningAnimation && isMobileOrTablet && animationPhase === 'stopped' && wonItem;

  const mobileScrollOnlyContent = showOpeningAnimation && isMobileOrTablet && itemsForMobileStrip.length > 0 && (
    <div className={`w-full h-full flex flex-col ${animationPhase === 'speeding-up' ? 'spinning-container' : ''}`}>
      <div className="relative w-full h-full flex items-center min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden flex items-center relative" style={{ contain: 'layout paint' }}>
          <div
            ref={mobileStripRef}
            className={`flex flex-nowrap items-center gap-3 py-4 case-open-strip ${animationPhase !== 'stopped' && animationPhase !== 'idle' ? 'case-open-strip-moving' : ''}`}
          >
            {itemsForMobileStrip.map((item: any, index: number) => (
              <div key={item.id || index} className="flex-shrink-0 w-[100px] h-[100px] sm:w-[112px] sm:h-[112px] flex items-center justify-center overflow-hidden" data-item-index={index}>
                <CaseItem
                  item={item}
                  index={index}
                  animationIndex={index}
                  showOpeningAnimation={showOpeningAnimation}
                  sliderPosition={sliderPosition}
                  sliderOffset={sliderOffset}
                  openingResult={openingResult}
                  animationPhase={animationPhase}
                  caseData={caseData}
                  showStrikeThrough={showStrikeThrough}
                  showGoldenSparks={showGoldenSparks}
                  showWinEffects={showWinEffects}
                  getRarityColor={getRarityColor}
                  generateGoldenSparks={generateGoldenSparks}
                  t={t}
                  onItemClick={(clickedItem) => handleItemClick(clickedItem, true)}
                  suppressBetweenHighlight={true}
                />
              </div>
            ))}
          </div>

          {/* Указатель центра: треугольник на верхней линии рельса, рамка слота под ним */}
          {animationPhase !== 'stopped' && animationPhase !== 'idle' && (
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 z-10 w-[100px] sm:w-[112px] h-[116px] sm:h-[128px] pointer-events-none case-mobile-center-pointer"
              aria-hidden
            >
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-amber-400/80" />
              <div className="absolute top-[10px] left-0 right-0 rounded-lg border-2 border-amber-400/80 bg-amber-400/5 shadow-[0_0_12px_rgba(251,191,36,0.25)] w-full h-[100px] sm:h-[112px]" />
            </div>
          )}
        </div>

        {/* Мобильный показ выигрыша: карточка по центру с плавным появлением */}
        {showMobileWinReveal && (
          <div className="absolute left-1/2 top-1/2 z-20 mobile-win-reveal w-[180px] sm:w-[200px] pointer-events-none">
            <div className={`rounded-xl border-2 p-3 sm:p-4 bg-gray-900/95 shadow-2xl ${getRarityColor(wonItem.rarity)}`}>
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-black/40 mb-2 flex items-center justify-center">
                <img
                  src={adaptImageSize(getItemImageUrl(wonItem.image_url, wonItem.name)) || getItemImageUrl(wonItem.image_url, wonItem.name)}
                  alt={wonItem.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-white font-semibold text-xs sm:text-sm text-center line-clamp-2 mb-1" title={wonItem.name}>
                {wonItem.name}
              </p>
              <p className="text-green-400 text-xs font-bold text-center">
                {t('case_preview_modal.you_won', { defaultValue: 'Вы выиграли!' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const modalContent = (
    <>
      {showWinEffects && <div className="win-flash-overlay" />}

      {/* Мобильные: во время анимации — тёмный фон (ничего кроме анимации), взрыв как на десктопе, затем показ выигрыша. */}
      {showOpeningAnimation && isMobileOrTablet && mobileScrollOnlyContent ? (
        <div className="fixed inset-0 z-[99999998] flex items-center justify-center w-full h-full bg-black">
          {showWinEffects && <div className="win-flash-overlay" style={{ zIndex: 99999999 }} />}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center px-0">
            {/* Горизонтальный блок во всю ширину: «рельс» с обводкой, анимация внутри */}
            <div className="w-full case-open-rail min-h-[180px] sm:min-h-[200px] flex items-center justify-center">
              {mobileScrollOnlyContent}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`fixed inset-0 z-[99999998] flex items-center justify-center transition-all duration-300 ${
              isAnimating ? 'bg-black bg-opacity-75' : 'bg-black bg-opacity-0'
            }`}
            onClick={handleClose}
            style={{
              backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0)',
            }}
          >
            <div
              className={`bg-[#1a1629] rounded-lg max-w-6xl w-[95%] sm:w-full mx-4 max-h-[90vh] shadow-2xl transition-all duration-1000 flex flex-col ${
                isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'
              } ${showWinEffects ? 'win-shake' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader
                caseData={caseData}
                caseImageUrl={caseImageUrl}
                fixedPrices={fixedPrices}
                resolvedPrice={getCasePrice(caseData)}
                onClose={handleClose}
                t={t}
              />

              <div
                className={`flex-1 min-h-0 relative virtualized-container flex flex-col ${
                  animationPhase === 'speeding-up' ? 'spinning-container' : ''
                }`}
                style={{ maxHeight: 'calc(90vh - 200px)', minHeight: isMobileOrTablet ? 180 : undefined }}
              >
                {isLoading ? (
            <div className="flex items-center justify-center py-12 p-6">
              <div className="spinner" />
              <p className="text-white ml-4">{t('case_preview_modal.loading_items')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 p-6">
              <p className="text-red-400">{t('case_preview_modal.loading_error')}</p>
            </div>
          ) : itemsWithAdjustedChances.length > 0 ? (
            isMobileOrTablet ? (
              /* Превью мобильный: крупный кейс, алерт, кнопка, сетка 2 колонки */
              <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden smooth-scroll p-4">
                  {/* Крупное изображение кейса — размер как на десктопе по ощущениям */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={caseImageUrl}
                      alt={caseData.name}
                      className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain rounded-lg"
                    />
                  </div>
                  {/* Блок цены / предупреждение и главная кнопка — на мобильной версии цену и блок «Шанс / N предметов» не показываем */}
                  {(() => {
                    const price = getCasePrice(caseData);
                    const balance = userData?.balance ?? 0;
                    const hasEnough = balance >= price;
                    const shortfall = Math.ceil(price - balance);
                    return (
                      <div className="space-y-3 mb-6">
                        {!hasEnough && price > 0 ? (
                          <div className="rounded-lg border-2 border-red-500/80 bg-red-950/50 p-4 text-center">
                            <p className="text-white font-semibold">
                              {price} ChiCoins — НЕ ХВАТАЕТ {shortfall} ChiCoins
                            </p>
                            <p className="text-red-200 text-sm mt-1">
                              Недостаточно средств для открытия кейса
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                window.dispatchEvent(new CustomEvent('openDepositModal'));
                              }}
                              className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                            >
                              <img src="/images/chiCoin.png" alt="" className="w-5 h-5" />
                              ПОПОЛНИТЬ БАЛАНС
                            </button>
                          </div>
                        ) : !isMobileOrTablet ? (
                          <div className="text-center">
                            {price > 0 ? (
                              <p className="text-orange-400 font-bold text-lg">{price} ChiCoins</p>
                            ) : (
                              <p className="text-green-400 font-bold text-lg">{t('case_preview_modal.free_case')}</p>
                            )}
                            <p className="text-gray-400 text-sm mt-1">
                              {t('case_preview_modal.chance')} — {itemsWithAdjustedChances.length} {t('case_preview_modal.items', { defaultValue: 'предметов' })}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}
                  {/* Заголовок и сетка содержимого */}
                  <h3 className="text-lg font-bold text-white mb-3">
                    {t('case_contents', { defaultValue: 'Содержимое кейса' })}
                  </h3>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 pb-4">
                    {itemsWithAdjustedChances.map((item: any, index: number) => (
                      <CaseItem
                        key={item.id || index}
                        item={item}
                        index={index}
                        animationIndex={index}
                        showOpeningAnimation={false}
                        sliderPosition={0}
                        sliderOffset={0}
                        openingResult={null}
                        animationPhase="idle"
                        caseData={caseData}
                        showStrikeThrough={false}
                        showGoldenSparks={false}
                        showWinEffects={false}
                        getRarityColor={getRarityColor}
                        generateGoldenSparks={generateGoldenSparks}
                        t={t}
                        onItemClick={(clickedItem) => handleItemClick(clickedItem, true)}
                      />
                    ))}
                  </div>
                </div>
            ) : (
              /* Десктоп: вертикальный скролл и сетка */
              <div
                ref={scrollContainerRef}
                className={`flex-1 p-6 overflow-y-auto smooth-scroll`}
                style={{ maxHeight: 'calc(90vh - 200px)' }}
              >
                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
                  {itemsWithAdjustedChances.map((item: any, index: number) => (
                    <CaseItem
                      key={item.id || index}
                      item={item}
                      index={index}
                      animationIndex={index}
                      showOpeningAnimation={showOpeningAnimation}
                      sliderPosition={sliderPosition}
                      sliderOffset={sliderOffset}
                      openingResult={openingResult}
                      animationPhase={animationPhase}
                      caseData={caseData}
                      showStrikeThrough={showStrikeThrough}
                      showGoldenSparks={showGoldenSparks}
                      showWinEffects={showWinEffects}
                      getRarityColor={getRarityColor}
                      generateGoldenSparks={generateGoldenSparks}
                      t={t}
                      onItemClick={(clickedItem) => handleItemClick(clickedItem, true)}
                    />
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12 p-6">
              <p className="text-gray-400">{t('case_preview_modal.no_items')}</p>
            </div>
          )}
        </div>

        <ModalFooter
          statusData={statusData}
          statusLoading={statusLoading}
          fixedPrices={fixedPrices}
          userData={userData}
          caseData={caseData}
          isProcessing={isProcessing}
          buyLoading={buyLoading}
          openLoading={openLoading}
          showOpeningAnimation={showOpeningAnimation}
          handleClose={handleClose}
          handleBuyCase={handleBuyCase}
          handleOpenCase={handleOpenCase}
          getCasePrice={getCasePrice}
          t={t}
          onBuyStatusClick={handleBuyStatusClick}
          buyStatusLoading={buySubscriptionLoading}
        />
            </div>
          </div>
        </>
      )}
    </>
  );

  // Рендерим модальное окно в body через портал
  return (
    <>
      {createPortal(modalContent, document.body)}
      {selectedItem && (
        <ItemInfoModal
          isOpen={showItemInfoModal}
          onClose={() => {
            setShowItemInfoModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          showDropChance={showDropChance}
          getRarityColor={getRarityColor}
          t={t}
        />
      )}
    </>
  );
};

export default CasePreviewModal;
