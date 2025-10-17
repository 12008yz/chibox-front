import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCaseItemsQuery, useGetCaseStatusQuery, useBuyCaseMutation, useOpenCaseMutation } from '../../features/cases/casesApi';
import { CaseTemplate } from '../../types/api';
import { useUserData } from '../../hooks/useUserData';
import { CaseItem } from './components/CaseItem';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import { CasePreviewModalProps } from './types';
import { getRarityColor, generateGoldenSparks, getDefaultCaseImage } from './utils';
import { injectStyles } from './styles';

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
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle');
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [showGoldenSparks, setShowGoldenSparks] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setAnimationPhase('idle');
      setShowOpeningAnimation(false);
      setOpeningResult(null);
      setShowStrikeThrough(false);
      setShowGoldenSparks(false);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setIsAnimating(true), 16);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setIsProcessing(false);
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Автоскролл к выбранному элементу во время анимации
  useEffect(() => {
    if (!scrollContainerRef.current || !showOpeningAnimation || animationPhase === 'idle') return;

    const container = scrollContainerRef.current;
    const items = container.querySelectorAll('[data-item-index]');
    const currentItem = items[sliderPosition] as HTMLElement;

    if (currentItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();
      const itemTop = itemRect.top - containerRect.top + container.scrollTop;
      const containerHeight = container.clientHeight;
      const targetScrollTop = itemTop - (containerHeight / 2) + (itemRect.height / 2);

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: animationPhase === 'spinning' ? 'auto' : 'smooth'
      });
    }
  }, [sliderPosition, showOpeningAnimation, animationPhase]);

  const handleClose = () => {
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
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);
    setIsProcessing(false);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  // Анимация открытия
  const startAnimation = useCallback((wonItem: any) => {
    setShowOpeningAnimation(true);
    setAnimationPhase('spinning');
    setShowStrikeThrough(false);
    setShowGoldenSparks(false);

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
    let initialSpeed = 150;
    let currentSpeed = initialSpeed;
    const distance = wonItemIndex;
    const slowDownStart = Math.max(0, distance - 7);

    const animateSlider = () => {
      if (currentAvailablePosition >= wonItemIndex) {
        const wonItemInFullList = itemsWithAdjustedChances.findIndex(item => item.id === wonItem.id);
        setSliderPosition(wonItemInFullList);
        setAnimationPhase('stopped');

        setTimeout(() => setShowGoldenSparks(true), 1000);
        setTimeout(() => {
          if (caseData.id === "44444444-4444-4444-4444-444444444444") {
            setShowStrikeThrough(true);
          }
        }, 2000);
        setTimeout(() => handleAnimationComplete(), caseData.id === '44444444-4444-4444-4444-444444444444' ? 5000 : 3500);
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

      if (currentAvailablePosition <= slowDownStart) {
        setAnimationPhase('spinning');
        currentSpeed = initialSpeed;
      } else {
        setAnimationPhase('slowing');
        const stepsLeft = wonItemIndex - currentAvailablePosition;
        const slowdownFactor = Math.max(0.1, stepsLeft / 7);
        currentSpeed = initialSpeed + (300 * (1 - slowdownFactor));
      }

      setTimeout(animateSlider, currentSpeed);
    };

    setTimeout(() => animateSlider(), 500);
  }, [itemsWithAdjustedChances, caseData.id, handleAnimationComplete]);

  const handleBuyCase = async () => {
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) return;
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
        if (paymentMethod === 'bank_card') {
          if (result.data?.paymentUrl) {
            window.location.href = result.data.paymentUrl;
          } else {
            alert('Ошибка: не получена ссылка для оплаты');
          }
        } else {
          if (result.data?.inventory_cases && result.data.inventory_cases.length > 0) {
            const inventoryCase = result.data.inventory_cases[0];
            await handleOpenCase(undefined, inventoryCase.id);
          } else {
            alert('Кейс успешно куплен!');
            handleClose();
          }
        }
      } else {
        alert('Ошибка покупки: ' + (result.message || 'Неизвестная ошибка'));
      }
    } catch (error: any) {
      console.error('Ошибка покупки кейса:', error);
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
    if (isProcessing || buyLoading || openLoading || showOpeningAnimation) return;
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

      const result = await openCase(openCaseParams).unwrap();

      if (result.success && result.data?.item) {
        setOpeningResult(result.data);
        startAnimation(result.data.item);
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
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  const caseImageUrl = caseData.image_url && caseData.image_url.trim() !== ''
    ? caseData.image_url
    : getDefaultCaseImage(caseData.name);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-75 backdrop-blur-sm' : 'bg-black bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#1a1629] rounded-lg max-w-6xl w-[95%] sm:w-full mx-4 max-h-[90vh] shadow-2xl transition-all duration-1000 flex flex-col ${
          isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          caseData={caseData}
          caseImageUrl={caseImageUrl}
          fixedPrices={fixedPrices}
          onClose={handleClose}
          t={t}
        />

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
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {itemsWithAdjustedChances.map((item: any, index: number) => (
                <CaseItem
                  key={item.id || index}
                  item={item}
                  index={index}
                  animationIndex={index}
                  showOpeningAnimation={showOpeningAnimation}
                  sliderPosition={sliderPosition}
                  openingResult={openingResult}
                  animationPhase={animationPhase}
                  caseData={caseData}
                  showStrikeThrough={showStrikeThrough}
                  showGoldenSparks={showGoldenSparks}
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
  );
};

export default CasePreviewModal;
