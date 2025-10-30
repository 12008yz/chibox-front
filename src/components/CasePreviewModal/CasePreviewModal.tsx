import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { throttle } from 'lodash-es';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../../features/cases/casesApi';
import { CaseTemplate } from '../../types/api';
import { useUserData } from '../../hooks/useUserData';
import { CaseItem } from './components/CaseItem';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import { CasePreviewModalProps } from './types';
import { getRarityColor, generateGoldenSparks, getDefaultCaseImage } from './utils';
import { injectStyles } from './styles';
import { getCaseImageUrl } from '../../utils/steamImageUtils';
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

  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'bank_card'>('balance');
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [openingResult, setOpeningResult] = useState<any>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'fake-slowing' | 'speeding-up' | 'wobbling' | 'falling' | 'stopped'>('idle');
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [showGoldenSparks, setShowGoldenSparks] = useState(false);
  const [shouldFakeSlowdown, setShouldFakeSlowdown] = useState(false);
  const [shouldStopBetween, setShouldStopBetween] = useState(false);
  const [sliderOffset, setSliderOffset] = useState(0);
  const [showWinEffects, setShowWinEffects] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationTimoutsRef = useRef<NodeJS.Timeout[]>([]); // Массив всех таймаутов анимации
  const animationIntervalsRef = useRef<NodeJS.Timeout[]>([]); // Массив всех интервалов анимации

  const { data: itemsData, isLoading, error } = useGetCaseItemsQuery(caseData.id, { skip: !isOpen });
  const { data: statusData, isLoading: statusLoading } = useGetCaseStatusQuery(caseData.id, { skip: !isOpen });
  const [buyCase, { isLoading: buyLoading }] = useBuyCaseMutation();
  const [openCase, { isLoading: openLoading }] = useOpenCaseMutation();

  // Функция для получения цены кейса
  const getCasePrice = useCallback((caseData: CaseTemplate): number => {
    if (statusData?.data?.price) {
      return statusData.data.price;
    }
    return caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум') ? 499 : 99;
  }, [statusData]);

  // Проверяем, достаточно ли средств на балансе
  const checkBalanceSufficient = useCallback((price: number): boolean => {
    if (paymentMethod === 'bank_card') return true;
    return (userData?.balance || 0) >= price;
  }, [paymentMethod, userData]);

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
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setIsAnimating(true), 16);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setIsProcessing(false);
      setShowOpeningAnimation(false);
      setAnimationPhase('idle');
      soundManager.stopAll(); // Останавливаем все звуки при закрытии
      // Очищаем все таймауты и интервалы анимации при закрытии
      animationTimoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimoutsRef.current = [];
      animationIntervalsRef.current.forEach(interval => clearInterval(interval));
      animationIntervalsRef.current = [];
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
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

  // Оптимизированный автоскролл с throttling
  const scrollToItem = useCallback(
    throttle((index: number) => {
      if (!scrollContainerRef.current || !showOpeningAnimation || animationPhase === 'idle') return;

      const container = scrollContainerRef.current;
      const items = container.querySelectorAll('[data-item-index]');
      const currentItem = items[index] as HTMLElement;

      if (currentItem) {
        // Используем requestAnimationFrame для плавности
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();
          const itemRect = currentItem.getBoundingClientRect();
          const itemTop = itemRect.top - containerRect.top + container.scrollTop;
          const containerHeight = container.clientHeight;
          const targetScrollTop = itemTop - (containerHeight / 2) + (itemRect.height / 2);

          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: animationPhase === 'spinning' ? 'auto' : 'smooth'
          });
        });
      }
    }, 16), // Throttle до 60 FPS
    [showOpeningAnimation, animationPhase]
  );

  // Автоскролл к выбранному элементу во время анимации
  useEffect(() => {
    if (!showOpeningAnimation || animationPhase === 'idle') return;
    scrollToItem(sliderPosition);
  }, [sliderPosition, showOpeningAnimation, animationPhase, scrollToItem]);

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
    setShowOpeningAnimation(false);
    setOpeningResult(null);
    setAnimationPhase('idle');
    setSliderPosition(0);
    setSliderOffset(0);
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);
    setShowWinEffects(false);
    setShouldStopBetween(false);
    setIsProcessing(false);

    // Останавливаем все звуки
    soundManager.stopAll();

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

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

    // 50% шанс на остановку между предметами (для теста, потом будет 5%)
    const useStopBetween = Math.random() < 0.5;
    setShouldStopBetween(useStopBetween);

    const availableItemsForAnimation = itemsWithAdjustedChances.filter(item => !item.isExcluded);
    const wonItemIndex = availableItemsForAnimation.findIndex(item => item.id === wonItem.id);

    if (wonItemIndex === -1) {
      console.error('ОШИБКА АНИМАЦИИ: Выигранный предмет не найден');
      setAnimationPhase('stopped');
      setTimeout(() => handleAnimationComplete(), 1500);
      return;
    }

    setSliderPosition(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let currentAvailablePosition = 0;
    const initialSpeed = 80; // Быстрее начальная скорость
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

    const animateSlider = () => {
      // Проверка на остановку между предметами (за 1 позицию до выигрыша)
      if (useStopBetween && currentAvailablePosition === wonItemIndex - 1) {
        const currentItemInFullList = itemsWithAdjustedChances.findIndex((item, idx) => {
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
                const wonItemInFullList = itemsWithAdjustedChances.findIndex(item => item.id === wonItem.id);
                setSliderPosition(wonItemInFullList);
                setAnimationPhase('stopped');

                // Крутая последовательность эффектов выигрыша
                trackTimeout(() => {
                  soundManager.play('endProcess'); // Звук синхронно с анимацией взрыва
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
        const wonItemInFullList = itemsWithAdjustedChances.findIndex(item => item.id === wonItem.id);
        setSliderPosition(wonItemInFullList);
        setAnimationPhase('stopped');

        // Крутая последовательность эффектов выигрыша
        trackTimeout(() => {
          soundManager.play('endProcess'); // Звук синхронно с анимацией взрыва
          setShowWinEffects(true);
        }, 300); // Вспышка и круги
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

    trackTimeout(() => animateSlider(), 500);
  }, [itemsWithAdjustedChances, caseData.id, handleAnimationComplete]);

  const handleBuyCase = async () => {
    console.log('=== handleBuyCase START ===');
    console.log('States:', { isProcessing, buyLoading, openLoading, showOpeningAnimation });

    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) {
      console.log('BLOCKED: один из флагов true, выход');
      return;
    }

    setIsProcessing(true);

    try {
      if (onBuyAndOpenCase) {
        console.log('Используем onBuyAndOpenCase callback');
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

      console.log('Отправка запроса на покупку кейса:', buyParams);
      const result = await buyCase(buyParams).unwrap();
      console.log('Результат покупки:', result);

      if (result.success) {
        if (paymentMethod === 'bank_card') {
          console.log('Метод оплаты: банковская карта');
          if (result.data?.paymentUrl) {
            window.location.href = result.data.paymentUrl;
          } else {
            alert('Ошибка: не получена ссылка для оплаты');
          }
        } else {
          console.log('Метод оплаты: баланс');
          console.log('inventory_cases:', result.data?.inventory_cases);

          if (result.data?.inventory_cases && result.data.inventory_cases.length > 0) {
            const inventoryCase = result.data.inventory_cases[0];
            console.log('Найден купленный кейс в инвентаре:', inventoryCase);
            console.log('Вызываем handleOpenCase с inventoryItemId:', inventoryCase.id);

            // Сбрасываем isProcessing перед вызовом handleOpenCase
            setIsProcessing(false);
            await handleOpenCase(undefined, inventoryCase.id);
            console.log('handleOpenCase завершен');
            return; // Возвращаемся, чтобы не сбрасывать isProcessing в finally
          } else {
            console.log('inventory_cases пустой или отсутствует');
            alert('Кейс успешно куплен!');
            handleClose();
          }
        }
      } else {
        console.error('Покупка не успешна:', result.message);
        alert('Ошибка покупки: ' + (result.message || 'Неизвестная ошибка'));
      }
    } catch (error: any) {
      console.error('Ошибка покупки кейса:', error);
      if (error?.status === 400 && error?.data?.message?.includes('Недостаточно средств')) {
        const requiredAmount = error?.data?.data?.required || 0;
        const availableAmount = error?.data?.data?.available || 0;
        const shortfall = requiredAmount - availableAmount;
        alert(`Недостаточно средств на балансе!\nТребуется: ${requiredAmount}₽\nДоступно: ${availableAmount}₽\nНе хватает: ${shortfall}₽`);
      } else {
        alert('Ошибка покупки кейса: ' + (error?.data?.message || error?.message || 'Неизвестная ошибка'));
      }
    } finally {
      console.log('=== handleBuyCase FINALLY ===');
      setIsProcessing(false);
    }
  };

  const handleOpenCase = async (caseId?: string, inventoryItemId?: string) => {
    console.log('=== handleOpenCase START ===');
    console.log('Параметры:', { caseId, inventoryItemId });
    console.log('caseData:', { id: caseData.id, name: caseData.name, type: caseData.type, min_subscription_tier: caseData.min_subscription_tier });
    console.log('statusData:', statusData?.data);
    console.log('States:', { isProcessing, buyLoading, openLoading, showOpeningAnimation });

    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) {
      console.log('BLOCKED: один из флагов true, выход');
      return;
    }

    setIsProcessing(true);

    try {
      const openCaseParams: any = {};
      if (inventoryItemId) {
        openCaseParams.inventoryItemId = inventoryItemId;
        console.log('Используем inventoryItemId:', inventoryItemId);
      } else if (caseId) {
        openCaseParams.case_id = caseId;
        console.log('Используем caseId:', caseId);
      } else {
        openCaseParams.template_id = caseData.id;
        console.log('Используем template_id (caseData.id):', caseData.id);
      }

      console.log('Отправка запроса на открытие кейса:', openCaseParams);
      console.log('userData:', { subscription_tier: userData?.subscription_tier, subscription_days_left: userData?.subscription_days_left });

      // Звук открытия кейса (не для ежедневного кейса)
      const isDailyCase = caseData.id === "44444444-4444-4444-4444-444444444444" || "11111111-1111-1111-1111-111111111111" || "22222222-2222-2222-2222-222222222222" || "33333333-3333-3333-3333-333333333333" || "55555555-5555-5555-5555-555555555555" || "66666666-6666-6666-6666-666666666666" || "77777777-7777-7777-7777-777777777777";
      if (!isDailyCase) {
        soundManager.play('openCase');
      }

      const result = await openCase(openCaseParams).unwrap();
      console.log('Результат открытия кейса:', result);

      if (result.success && result.data?.item) {
        console.log('Кейс успешно открыт, запуск анимации. Предмет:', result.data.item);
        setOpeningResult(result.data);
        startAnimation(result.data.item);
      } else {
        console.warn('Открытие не успешно или нет предмета в результате');
      }
    } catch (error: any) {
      console.error('Ошибка открытия кейса:', error);
      if (error?.data?.message?.includes('уже получали') || error?.data?.message?.includes('завтра')) {
        alert(error.data.message || 'Кейс уже получен сегодня');
        onClose();
        if (onDataUpdate) {
          setTimeout(() => onDataUpdate(), 100);
        }
      } else {
        alert(error?.data?.message || 'Произошла ошибка при открытии кейса');
      }
    } finally {
      console.log('=== handleOpenCase FINALLY ===');
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? getCaseImageUrl(caseData.image_url)
    : getDefaultCaseImage(caseData.name);

  const modalContent = (
    <>
      {/* Вспышка на весь экран при победе */}
      {showWinEffects && <div className="win-flash-overlay" />}

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
          onClose={handleClose}
          t={t}
        />

        {/* Содержимое кейса - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 p-6 overflow-y-auto relative virtualized-container smooth-scroll ${
            animationPhase === 'speeding-up' ? 'spinning-container' : ''
          }`}
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('case_preview_modal.no_items')}</p>
            </div>
          )}
        </div>

        <ModalFooter
          statusData={statusData}
          statusLoading={statusLoading}
          fixedPrices={fixedPrices}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
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
          checkBalanceSufficient={checkBalanceSufficient}
          t={t}
        />
      </div>
    </div>
    </>
  );

  // Рендерим модальное окно в body через портал
  return createPortal(modalContent, document.body);
};

export default CasePreviewModal;
