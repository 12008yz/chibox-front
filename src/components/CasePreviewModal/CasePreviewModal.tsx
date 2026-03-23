import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../../features/cases/casesApi';
import { useBuySubscriptionMutation } from '../../features/subscriptions/subscriptionsApi';
import { CaseTemplate } from '../../types/api';
import { useUserData } from '../../hooks/useUserData';
import { CaseItem } from './components/CaseItem';
import { StaticCaseItem } from './components/StaticCaseItem';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import ItemInfoModal from './components/ItemInfoModal';
import { CasePreviewModalProps } from './types';
import { getRarityColor, generateGoldenSparks, getDefaultCaseImage } from './utils';
import { injectStyles } from './styles';
import { getCaseImageUrl, getItemImageUrl, adaptImageSize, preloadItemImages, preloadItemImagesAndWait } from '../../utils/steamImageUtils';
import { getApiErrorMessage } from '../../utils/config';
import { soundManager } from '../../utils/soundManager';
import { rouletteAudio } from '../../utils/rouletteAudio';
import { useAppDispatch } from '../../store/hooks';
import { setShowAuthModal } from '../../store/slices/uiSlice';

// Добавляем стили в head только один раз
injectStyles();

/** Как у горизонтальной «рулетки»: easing близок к cubic-bezier(0.22, 0.2, 0.1, 0.985) — быстрый старт, длинное плавное торможение. */
function cubicBezierYatX(t: number, x1: number, y1: number, x2: number, y2: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const sampleCurveX = (u: number) =>
    3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
  const sampleCurveY = (u: number) =>
    3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  let low = 0;
  let high = 1;
  let u = t;
  for (let i = 0; i < 14; i++) {
    u = (low + high) / 2;
    const x = sampleCurveX(u);
    if (x < t) low = u;
    else high = u;
  }
  u = (low + high) / 2;
  return sampleCurveY(u);
}

// Портал в documentElement, чтобы подложка (fixed) не привязывалась к body с position:fixed — иначе чёрный фон только в нижней части экрана
const MODAL_PORTAL_TARGET = typeof document !== 'undefined' ? document.documentElement : null;

const CasePreviewModal: React.FC<CasePreviewModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onBuyAndOpenCase,
  fixedPrices = false,
  onDataUpdate
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { userData } = useUserData();
  const isGuest = !userData;

  const paymentMethod = 'balance' as const; // Всегда используем только баланс
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  /** Плавное «закрытие» превью перед полноэкранной рулеткой */
  const [casePreviewExiting, setCasePreviewExiting] = useState(false);
  const [openingResult, setOpeningResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'fake-slowing' | 'speeding-up' | 'wobbling' | 'falling' | 'stopped'>('idle');
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [showGoldenSparks, setShowGoldenSparks] = useState(false);
  const [_shouldStopBetween, setShouldStopBetween] = useState(false);
  const [sliderOffset, setSliderOffset] = useState(0);
  const [showWinEffects, setShowWinEffects] = useState(false);
  const [showItemInfoModal, setShowItemInfoModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDropChance, setShowDropChance] = useState(false);
  const [isPreparingAssets, setIsPreparingAssets] = useState(false);
  // Предметы в горизонтальной полоске рулетки (мобилка + десктоп)
  const [mobileAnimationItems, setMobileAnimationItems] = useState<any[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationTimoutsRef = useRef<NodeJS.Timeout[]>([]); // Массив всех таймаутов анимации
  const animationIntervalsRef = useRef<NodeJS.Timeout[]>([]); // Массив всех интервалов анимации
  const scrollLockRef = useRef<number | null>(null); // Позиция скролла окна при открытии (для восстановления)
  // Мобильная оптимизация: позиция полоски через ref, без лишних re-render на каждый шаг
  const mobileStripRef = useRef<HTMLDivElement>(null);
  const mobileAnimationRef = useRef<{ position: number; offset: number }>({ position: 0, offset: 0 });
  // Шаг полоски: мобилка 100+12 / 112+12; десктоп 128+16 (gap-4)
  /** Шаг ленты = ширина карточки + gap (см. классы case-open-strip и padding в styles). ~+20% к базовым размерам. */
  const getStripStepPx = () => {
    if (typeof window === 'undefined') return 134;
    if (window.innerWidth >= 1024) return 174;
    return window.innerWidth >= 640 ? 148 : 134;
  };

  // Мобильная/планшетная версия: по умолчанию false (десктоп), чтобы при открытии с десктопа не показывалась мобильная подложка
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isIPhone, setIsIPhone] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const check = () => setIsMobileOrTablet(media.matches);
    check(); // сразу при монтировании
    media.addEventListener('change', check);
    return () => media.removeEventListener('change', check);
  }, []);
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent || '';
    const platform = (navigator as any).platform || '';
    const touchPoints = (navigator as any).maxTouchPoints || 0;
    const isIOSDevice =
      /iPhone|iPod/i.test(ua) ||
      /iPad/i.test(ua) ||
      (platform === 'MacIntel' && touchPoints > 1);
    setIsIPhone(isIOSDevice);
  }, []);

  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(caseData.id, { skip: !isOpen });
  const { data: statusData, isLoading: statusLoading, refetch: refetchCaseStatus } = useGetCaseStatusQuery(caseData.id, { skip: !isOpen || isGuest });
  const [buyCase, { isLoading: buyLoading }] = useBuyCaseMutation();

  // Подтягивать статус при открытии только для авторизованных (у гостей запрос skip — refetch вызовет RTK #38)
  useEffect(() => {
    if (isOpen && caseData?.id && !isGuest) refetchCaseStatus();
  }, [isOpen, caseData?.id, isGuest, refetchCaseStatus]);

  // Предзагрузка изображений предметов при открытии модалки — чтобы на iPhone картинки успевали прогрузиться до анимации
  useEffect(() => {
    if (!isOpen || !itemsData?.data?.items?.length) return;
    const urls = itemsData.data.items.map((item) => item.image_url);
    preloadItemImages(urls);
  }, [isOpen, itemsData?.data?.items]);

  // Полоска рулетки: сброс transform при старте (мобилка и десктоп)
  useEffect(() => {
    if (showOpeningAnimation && mobileStripRef.current) {
      mobileStripRef.current.style.transform = 'translate3d(0,0,0)';
      mobileStripRef.current.style.webkitTransform = 'translate3d(0,0,0)';
    }
  }, [showOpeningAnimation]);

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

  // Гости могут просматривать превью — редирект убран

  // Обработка открытия/закрытия модала
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsProcessing(false);
      setSliderPosition(0);
      setSliderOffset(0);
      setAnimationPhase('idle');
      setShowOpeningAnimation(false);
      setCasePreviewExiting(false);
      setOpeningResult(null);
      setShowStrikeThrough(false);
      setShowGoldenSparks(false);
      setShowWinEffects(false);
      setShouldStopBetween(false);
      // Блокировка скролла: сдвигаем только #root (не body), чтобы подложка модалки не ломалась
      const scrollY = window.scrollY;
      const root = document.getElementById('root');
      const rootScrollTop = root ? root.scrollTop : 0;
      scrollLockRef.current = scrollY;
      if (root) {
        const r = root as HTMLElement;
        r.dataset.caseModalScrollTop = String(rootScrollTop);
        r.style.overflow = 'hidden';
        r.style.touchAction = 'none';
        r.style.position = 'fixed';
        r.style.top = `-${scrollY}px`;
        r.style.left = '0';
        r.style.right = '0';
        r.style.width = '100%';
      }
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      const timer = setTimeout(() => setIsAnimating(true), 16);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setIsProcessing(false);
      setShowOpeningAnimation(false);
      setCasePreviewExiting(false);
      setAnimationPhase('idle');
      rouletteAudio.stopAll();
      soundManager.stopAll(); // Останавливаем все звуки при закрытии
      animationTimoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimoutsRef.current = [];
      animationIntervalsRef.current.forEach(interval => clearInterval(interval));
      animationIntervalsRef.current = [];
      // Восстановление скролла и позиции
      const savedScroll = scrollLockRef.current;
      const root = document.getElementById('root');
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (root) {
        const r = root as HTMLElement;
        r.style.overflow = '';
        r.style.touchAction = '';
        r.style.position = '';
        r.style.top = '';
        r.style.left = '';
        r.style.right = '';
        r.style.width = '';
        const savedRootScroll = r.dataset.caseModalScrollTop;
        if (savedRootScroll !== undefined) {
          r.scrollTop = Number(savedRootScroll);
          delete r.dataset.caseModalScrollTop;
        }
      }
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
      const root = document.getElementById('root');
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (root) {
        const r = root as HTMLElement;
        r.style.overflow = '';
        r.style.touchAction = '';
        r.style.position = '';
        r.style.top = '';
        r.style.left = '';
        r.style.right = '';
        r.style.width = '';
        const savedRootScroll = r.dataset.caseModalScrollTop;
        if (savedRootScroll !== undefined) {
          r.scrollTop = Number(savedRootScroll);
          delete r.dataset.caseModalScrollTop;
        }
      }
      if (scrollLockRef.current !== null) {
        window.scrollTo(0, scrollLockRef.current);
        scrollLockRef.current = null;
      }
      rouletteAudio.stopAll();
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
    rouletteAudio.stopAll();
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

  const prepareIPhoneAssetsBeforeAnimation = useCallback(async (wonItem: any) => {
    if (!isIPhone || !isMobileOrTablet) return;

    const baseStrip = itemsWithAdjustedChances.filter(item => !item.isExcluded);
    const stripUrls = baseStrip.map((item) => getItemImageUrl(item.image_url, item.name));
    const wonUrl = wonItem ? getItemImageUrl(wonItem.image_url, wonItem.name) : null;
    const imageUrls = wonUrl ? [...stripUrls, wonUrl] : stripUrls;

    setIsPreparingAssets(true);
    try {
      await Promise.all([
        preloadItemImagesAndWait(imageUrls, 7000),
        soundManager.waitForSounds(['openCase', 'process', 'endProcess'], 1800),
        rouletteAudio.preload(),
      ]);
    } finally {
      setIsPreparingAssets(false);
    }
  }, [isIPhone, isMobileOrTablet, itemsWithAdjustedChances]);

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
    rouletteAudio.stopAll();
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
    } else if (onDataUpdate) {
      onDataUpdate();
    }

    // Сбрасываем результат после обработки
    setOpeningResult(null);
  }, [openingResult, onDataUpdate]);

  /** Ядро рулетки (после выхода с превью). */
  const runRouletteAnimationCore = useCallback(
    (wonItem: any, trackTimeout: (callback: () => void, delay: number) => void) => {
    setShowOpeningAnimation(true);
    setAnimationPhase('spinning');
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);
    setShowWinEffects(false);
    setShouldStopBetween(false);

    let baseStrip = itemsWithAdjustedChances.filter(item => !item.isExcluded);
    let wonItemIndex = baseStrip.findIndex(item => item.id === wonItem.id);

    if (wonItemIndex === -1) {
      setAnimationPhase('stopped');
      trackTimeout(() => handleAnimationComplete(), 1500);
      return;
    }

    const L = baseStrip.length;
    if (L === 0) {
      setAnimationPhase('stopped');
      trackTimeout(() => handleAnimationComplete(), 1500);
      return;
    }

    const tripled = [...baseStrip, ...baseStrip, ...baseStrip];
    const targetSlotIndex = L + wonItemIndex;

    setMobileAnimationItems(tripled);
    setSliderPosition(0);
    setSliderOffset(0);

    const applyMobileStripTransformFloat = (position: number, offset: number) => {
      mobileAnimationRef.current.position = position;
      mobileAnimationRef.current.offset = offset;
      if (mobileStripRef.current) {
        const px = -(position + offset) * getStripStepPx();
        mobileStripRef.current.style.transform = `translate3d(${px}px,0,0)`;
        mobileStripRef.current.style.webkitTransform = `translate3d(${px}px,0,0)`;
      }
    };

    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const useWebAudioForIPhone = isIPhone && !reduceMotion;
    const durationMs = reduceMotion
      ? Math.min(900, 400 + targetSlotIndex * 28)
      : isIPhone
        ? 3600 + Math.random() * 500
        : 5200 + Math.random() * 800;
    const startDelayMs = reduceMotion ? 120 : 380;
    let lastTickSlot = -1;
    let lastSoundAt = 0;
    const SOUND_MIN_MS = isIPhone ? 72 : 38;

    const finishSpin = () => {
      if (useWebAudioForIPhone) {
        rouletteAudio.stopLoop();
      } else {
        soundManager.stop('process');
      }
      const el = mobileStripRef.current;
      if (el) {
        el.style.removeProperty('transition');
      }
      applyMobileStripTransformFloat(targetSlotIndex, 0);
      setSliderPosition(targetSlotIndex);
      setAnimationPhase('stopped');
      trackTimeout(() => {
        // Разносим по кадрам звук и тяжелые win-эффекты, чтобы убрать микро-рывок в конце
        if (useWebAudioForIPhone) {
          rouletteAudio.playEnd();
        } else {
          soundManager.play('endProcess');
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setShowWinEffects(true));
        });
      }, 300);
      trackTimeout(() => setShowGoldenSparks(true), 950);
      trackTimeout(() => {
        if (caseData.id === "44444444-4444-4444-4444-444444444444") {
          setShowStrikeThrough(true);
        }
      }, 1500);
      trackTimeout(() => handleAnimationComplete(), caseData.id === '44444444-4444-4444-4444-444444444444' ? 5000 : 4000);
    };

    trackTimeout(() => {
      if (useWebAudioForIPhone) {
        rouletteAudio.startProcessLoop();
      }
      if (mobileStripRef.current) {
        mobileStripRef.current.style.transition = 'none';
      }
      applyMobileStripTransformFloat(0, 0);

      let animStart: number | null = null;
      const tick = (now: number) => {
        if (animStart === null) animStart = now;
        const elapsed = now - animStart;
        const t = Math.min(1, elapsed / durationMs);
        const eased = cubicBezierYatX(t, 0.22, 0.2, 0.1, 0.985);
        const pos = eased * targetSlotIndex;
        applyMobileStripTransformFloat(pos, 0);

        const slot = Math.min(targetSlotIndex, Math.max(0, Math.floor(pos + 1e-9)));
        if (slot > lastTickSlot) {
          lastTickSlot = slot;
          if (!useWebAudioForIPhone && now - lastSoundAt >= SOUND_MIN_MS) {
            soundManager.play('process', false, true);
            lastSoundAt = now;
          }
          /* Не вызываем setSliderPosition на каждый слот: иначе все ~72 CaseItem
             перерисовываются десятки раз в секунду в начале ease-out — визуальные запинания. */
        }

        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(tick);
        } else {
          animationFrameRef.current = null;
          finishSpin();
        }
      };
      /* Два кадра после монтирована длинной полоски — layout/paint, без смешивания с первым тиком анимации */
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = requestAnimationFrame(tick);
      });
    }, startDelayMs);
    },
    [itemsWithAdjustedChances, caseData.id, handleAnimationComplete, isIPhone]
  );

  // Горизонтальная рулетка: плавный translate3d (мобилка и десктоп), cubic-bezier(0.22, 0.2, 0.1, 0.985)
  const startAnimation = useCallback(
    (wonItem: any) => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      animationTimoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimoutsRef.current = [];
      animationIntervalsRef.current.forEach(interval => clearInterval(interval));
      animationIntervalsRef.current = [];

      const trackTimeout = (callback: () => void, delay: number) => {
        const timeout = setTimeout(callback, delay);
        animationTimoutsRef.current.push(timeout);
        return timeout;
      };

      const reduceMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const previewExitMs = reduceMotion ? 0 : 440;

      if (previewExitMs === 0) {
        runRouletteAnimationCore(wonItem, trackTimeout);
        return;
      }

      setCasePreviewExiting(true);
      trackTimeout(() => {
        setCasePreviewExiting(false);
        runRouletteAnimationCore(wonItem, trackTimeout);
      }, previewExitMs);
    },
    [runRouletteAnimationCore]
  );

  const handleShowAuth = useCallback(() => {
    onClose();
    dispatch(setShowAuthModal(true));
  }, [onClose, dispatch]);

  const handleBuyCase = async () => {
    if (isGuest) {
      handleShowAuth();
      return;
    }
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation || casePreviewExiting || isPreparingAssets) {
      return;
    }

    setIsProcessing(true);

    try {
      if (onBuyAndOpenCase) {
        const result = await onBuyAndOpenCase(caseData);
        if (result && result.item) {
          await prepareIPhoneAssetsBeforeAnimation(result.item);
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
    if (isGuest) {
      handleShowAuth();
      return;
    }
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation || casePreviewExiting || isPreparingAssets) {
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
        if (isIPhone) {
          rouletteAudio.playOpenCase();
        } else {
          soundManager.play('openCase');
        }
      }

      const result = await openCase(openCaseParams).unwrap();

      if (result.success && result.data?.item) {
        await prepareIPhoneAssetsBeforeAnimation(result.data.item);
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

  // При закрытии обязательно очищаем портал (null), иначе подложка остаётся в DOM
  if (!isVisible) {
    return (
      <>
        {MODAL_PORTAL_TARGET && createPortal(null, MODAL_PORTAL_TARGET)}
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
  }

  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? getCaseImageUrl(caseData.image_url)
    : getDefaultCaseImage(caseData.name);

  // Полоска рулетки: до 24×3 слотов; вне анимации — запас из содержимого кейса
  const itemsForMobileStrip = mobileAnimationItems.length > 0 ? mobileAnimationItems : itemsWithAdjustedChances;
  const wonItem = openingResult?.item;
  const caseStripActive = showOpeningAnimation && itemsForMobileStrip.length > 0;
  const showStripWinReveal = showOpeningAnimation && animationPhase === 'stopped' && wonItem;

  const showStripCenterMarker = animationPhase !== 'stopped' && animationPhase !== 'idle';
  const stripMarkerPulse = animationPhase === 'slowing';

  const renderCaseOpenStrip = (layoutDesktop: boolean) =>
    caseStripActive ? (
      <div className={`w-full h-full flex flex-col min-h-0 ${animationPhase === 'speeding-up' ? 'spinning-container' : ''}`}>
        <div className="relative w-full flex-1 flex min-h-[192px] md:min-h-[216px] items-center">
          <div className="absolute inset-0 case-open-viewport-overlay" aria-hidden />

          <div className="relative z-[8] flex-1 min-h-0 overflow-hidden flex items-center">
            <div
              className={`case-open-neon-bracket case-open-neon-bracket--left ${layoutDesktop ? 'case-open-neon-bracket--desktop' : ''}`}
              aria-hidden
            >
              <span className="case-open-neon-limb case-open-neon-limb--left-v" />
              <span className="case-open-neon-limb case-open-neon-limb--left-ht" />
              <span className="case-open-neon-limb case-open-neon-limb--left-hb" />
            </div>
            <div
              className={`case-open-neon-bracket case-open-neon-bracket--right ${layoutDesktop ? 'case-open-neon-bracket--desktop' : ''}`}
              aria-hidden
            >
              <span className="case-open-neon-limb case-open-neon-limb--right-v" />
              <span className="case-open-neon-limb case-open-neon-limb--right-ht" />
              <span className="case-open-neon-limb case-open-neon-limb--right-hb" />
            </div>

            <div
              className="relative z-[1] flex-1 min-h-0 overflow-hidden flex items-center case-open-viewport-fade"
              style={{ contain: 'layout paint' }}
            >
              <div
                ref={mobileStripRef}
                className={`flex flex-nowrap items-center case-open-strip ${layoutDesktop ? 'case-open-strip--desktop gap-5 py-5 md:py-6' : 'gap-3.5 py-3.5 sm:py-5'} ${animationPhase !== 'stopped' && animationPhase !== 'idle' ? 'case-open-strip-moving' : ''}`}
              >
                {itemsForMobileStrip.map((item: any, index: number) => (
                  <div
                    key={`strip-${index}-${item.id}`}
                    className={
                      layoutDesktop
                        ? 'flex-shrink-0 w-[154px] h-[154px] flex items-center justify-center overflow-visible'
                        : 'flex-shrink-0 w-[120px] h-[120px] sm:w-[134px] sm:h-[134px] flex items-center justify-center overflow-visible'
                    }
                    data-item-index={index}
                  >
                    {isIPhone && animationPhase !== 'stopped' ? (
                      <StaticCaseItem
                        item={item}
                        getRarityColor={getRarityColor}
                        t={t}
                      />
                    ) : (
                      (() => {
                        const winningItemId = openingResult?.item?.id;
                        const isWinningStripItem = !!winningItemId && item.id === winningItemId;
                        return (
                      <CaseItem
                        item={item}
                        index={index}
                        animationIndex={index}
                        showOpeningAnimation={showOpeningAnimation}
                        sliderPosition={animationPhase === 'stopped' ? sliderPosition : -1}
                        sliderOffset={sliderOffset}
                        openingResult={openingResult}
                        animationPhase={animationPhase}
                        caseData={caseData}
                        showStrikeThrough={isWinningStripItem ? showStrikeThrough : false}
                        showGoldenSparks={isWinningStripItem ? showGoldenSparks : false}
                        showWinEffects={isWinningStripItem ? showWinEffects : false}
                        getRarityColor={getRarityColor}
                        generateGoldenSparks={generateGoldenSparks}
                        t={t}
                        onItemClick={(clickedItem) => handleItemClick(clickedItem, true)}
                        suppressBetweenHighlight={true}
                      />
                        );
                      })()
                    )}
                  </div>
                ))}
              </div>
            </div>

            {showStripCenterMarker && (
              <div
                className={`absolute left-1/2 top-0 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none case-open-center-marker ${stripMarkerPulse ? 'case-open-center-marker--pulse' : ''}`}
                aria-hidden
              >
                <div className="case-open-marker-needle" />
                <div
                  className={
                    layoutDesktop
                      ? 'w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-amber-300'
                      : 'w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-amber-300'
                  }
                />
              </div>
            )}
          </div>

          {showStripWinReveal && (
            <div
              className={`absolute left-1/2 top-1/2 z-20 mobile-win-reveal pointer-events-none ${layoutDesktop ? 'w-[288px]' : 'w-[216px] sm:w-[240px]'}`}
            >
              <div className={`rounded-xl border-2 p-3 sm:p-4 bg-gray-900/95 shadow-2xl ${layoutDesktop ? 'p-4' : ''} ${getRarityColor(wonItem.rarity)}`}>
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-black/40 mb-2 flex items-center justify-center">
                  <img
                    loading="lazy"
                    src={
                      adaptImageSize(getItemImageUrl(wonItem.image_url, wonItem.name)) ||
                      getItemImageUrl(wonItem.image_url, wonItem.name)
                    }
                    alt={wonItem.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p
                  className={`text-white font-semibold text-center line-clamp-2 mb-1 ${layoutDesktop ? 'text-sm' : 'text-xs sm:text-sm'}`}
                  title={wonItem.name}
                >
                  {wonItem.name}
                </p>
                <p className={`text-green-400 font-bold text-center ${layoutDesktop ? 'text-sm' : 'text-xs'}`}>
                  {t('case_preview_modal.you_won', { defaultValue: 'Вы выиграли!' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    ) : null;

  // Обёртка с явным viewport: избегаем бага, когда подложка рисуется «в полэкрана» из-за body position:fixed
  const viewportWrapperStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100vw',
    bottom: 0,
    height: '100dvh',
    minHeight: '100dvh',
    zIndex: 99999998,
    isolation: 'isolate',
  };

  const modalContent = (
    <div
      style={viewportWrapperStyle}
      className={`flex items-center justify-center min-h-[100dvh] transition-[background-color] duration-500 ease-out ${
        caseStripActive ? 'bg-black/92' : casePreviewExiting ? 'bg-black/80' : 'bg-black/60'
      }`}
      onClick={caseStripActive || casePreviewExiting ? undefined : handleClose}
    >
      {/* Анимация открытия: только рулетка на весь экран — без шапки, футера и рамки */}
      {caseStripActive ? (
        <div
          className="case-open-roulette-layer absolute inset-0 flex items-center justify-center w-full h-full"
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="w-full max-w-[100vw] flex items-center justify-center px-1 sm:px-3 md:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {renderCaseOpenStrip(!isMobileOrTablet)}
          </div>
        </div>
      ) : (
        <div
          className={`bg-[#1a1629] rounded-lg max-w-6xl w-[95%] sm:w-full mx-4 h-[90dvh] max-h-[90dvh] overflow-hidden shadow-2xl flex flex-col ${
            casePreviewExiting
              ? 'pointer-events-none opacity-0 scale-[0.93] translate-y-3 blur-md transition-all duration-[440ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
              : `transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`
          } ${showWinEffects && !casePreviewExiting ? 'win-shake' : ''}`}
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
                style={{ minHeight: isMobileOrTablet ? 180 : undefined, overflow: 'hidden' }}
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
              <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden smooth-scroll scrollbar-hide p-4">
                  {/* Крупное изображение кейса — размер как на десктопе по ощущениям */}
                  <div className="flex justify-center mb-4">
                    <img loading="lazy" src={caseImageUrl}
                      alt={caseData.name}
                      className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain rounded-lg"
                    />
                  </div>
                  {/* Блок цены / предупреждение и главная кнопка — на мобильной версии цену и блок «Шанс / N предметов» не показываем */}
                  {(() => {
                    if (isGuest) {
                      return (
                        <div className="rounded-lg border-2 border-amber-500/50 bg-amber-950/30 p-4 text-center mb-6">
                          <p className="text-white font-semibold">
                            {t('case_preview_modal.login_to_open', { defaultValue: 'Войдите, чтобы открыть кейс' })}
                          </p>
                          <button
                            type="button"
                            onClick={handleShowAuth}
                            className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
                          >
                            {t('case_preview_modal.login', { defaultValue: 'Войти' })}
                          </button>
                        </div>
                      );
                    }
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
                              <img loading="lazy" src="/images/chiCoinFull.webp" alt="" className="w-5 h-5 inline-block object-contain align-middle self-center" width="20" height="20" />
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
              /* Десктоп: сетка (рулетка — отдельный полноэкранный слой выше) */
              <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 p-6 overflow-y-auto smooth-scroll scrollbar-hide flex flex-col"
              >
                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
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
          isPreparingAssets={isPreparingAssets}
          buyLoading={buyLoading}
          openLoading={openLoading}
          showOpeningAnimation={showOpeningAnimation}
          casePreviewExiting={casePreviewExiting}
          handleClose={handleClose}
          handleBuyCase={handleBuyCase}
          handleOpenCase={handleOpenCase}
          getCasePrice={getCasePrice}
          t={t}
          onBuyStatusClick={handleBuyStatusClick}
          buyStatusLoading={buySubscriptionLoading}
          isGuest={isGuest}
          onLoginRequest={handleShowAuth}
        />
        </div>
      )}
    </div>
  );

  // Рендерим модальное окно в documentElement, чтобы fixed-подложка всегда на весь viewport
  return (
    <>
      {MODAL_PORTAL_TARGET && createPortal(modalContent, MODAL_PORTAL_TARGET)}
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
