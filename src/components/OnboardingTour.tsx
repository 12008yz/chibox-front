import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { CelebrateIcon, GiftIcon, TicTacToeIcon, BalanceIcon } from './icons';

interface OnboardingStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrowDirection: 'down' | 'right' | 'up' | 'left';
  mobileTitle?: string;
  mobileDescription?: string;
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isActive, onComplete }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      targetId: 'onboarding-balance',
      title: t('onboarding.welcome_title', 'Добро пожаловать!'),
      description: t('onboarding.welcome_description', 'Поздравляем с регистрацией! Специально для вас мы подготовили приветственные бонусы на первые 2 дня. Давайте покажем все возможности!'),
      position: 'bottom',
      arrowDirection: 'down',
      mobileTitle: 'Добро пожаловать!',
    },
    {
      id: 'tictactoe',
      targetId: 'onboarding-tictactoe-button',
      title: t('onboarding.tictactoe_title', 'Крестики-Нолики'),
      description: t('onboarding.tictactoe_description', 'Сразитесь! Победа принесет вам бонусный кейс.'),
      position: 'bottom',
      arrowDirection: 'down',
      mobileTitle: 'Крестики-нолики',
      mobileDescription: 'Найдите кейс с кнопкой "Играть". Победите компьютер, чтобы получить награду!'
    },
    {
      id: 'free_cases',
      targetId: 'onboarding-cases',
      title: t('onboarding.free_cases_title', '2 Бесплатных Кейса!'),
      description: t('onboarding.free_cases_description', 'Вот ваш бесплатный кейс! У вас есть 2 попытки. Успейте открыть их!'),
      position: 'bottom',
      arrowDirection: 'down',
      mobileTitle: 'Бесплатные Кейсы',
      mobileDescription: 'Прокрутите вниз и найдите бесплатные кейсы. У вас есть 2 попытки открыть их!'
    },
    {
      id: 'balance',
      targetId: 'onboarding-balance',
      title: t('onboarding.balance_title', 'Ваш Баланс'),
      description: t('onboarding.balance_description', 'Здесь отображается ваш баланс. После того как закончатся бесплатные бонусы, можете пополнить счёт и продолжить играть в любое время!'),
      position: 'bottom',
      arrowDirection: 'down',
      mobileTitle: 'Ваш Баланс',
      mobileDescription: 'В меню (☰) вверху вы увидите свой баланс. После окончания бонусов можете пополнить его кнопкой "+".'
    }
  ];

  // Функция для получения иконки по id шага
  const getStepIcon = (stepId: string) => {
    const iconClass = "inline-block mr-2";
    switch (stepId) {
      case 'welcome':
        return <CelebrateIcon className={`${iconClass} w-6 h-6`} />;
      case 'free_cases':
        return <GiftIcon className={`${iconClass} w-6 h-6`} />;
      case 'safe':
        return <span className={`${iconClass} text-2xl`}>🔐</span>;
      case 'tictactoe':
        return <TicTacToeIcon className={`${iconClass} w-6 h-6`} />;
      case 'balance':
        return <BalanceIcon className={`${iconClass} w-6 h-6`} />;
      default:
        return null;
    }
  };

  // Определяем размер экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isActive || isMobile) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;

      const element = document.getElementById(step.targetId);

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setTimeout(updatePosition, 100);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, isMobile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isActive) return null;

  const step = steps[currentStep];

  // Мобильная версия - простое модальное окно
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .mobile-onboarding-modal {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>

        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 pointer-events-auto">
          {/* Затемнение */}
          <div
            className="absolute inset-0 bg-black/80"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
            onClick={handleSkip}
          ></div>

          {/* Модальное окно */}
          <div className="mobile-onboarding-modal relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border-2 border-cyan-400 shadow-2xl">
            {/* Кнопка закрытия */}
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Заголовок */}
            <h2 className="text-white text-2xl font-bold mb-4 pr-8 flex items-center">
              {getStepIcon(step.id)}
              {step.mobileTitle || step.title}
            </h2>

            {/* Описание */}
            <p className="text-gray-300 text-base leading-relaxed mb-6 whitespace-pre-line">
              {step.mobileDescription || step.description}
            </p>

            {/* Прогресс */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-cyan-400 scale-110'
                        : index < currentStep
                        ? 'bg-cyan-600'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm font-medium">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            {/* Кнопки навигации */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Назад</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
              >
                <span>
                  {currentStep < steps.length - 1 ? 'Далее' : 'Начать играть!'}
                </span>
                {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Подсказка */}
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Пропустить обучение
            </button>
          </div>
        </div>
      </>
    );
  }

  // Десктопная версия - с подсветкой элементов
  if (!targetPosition) return null;

  const getTooltipPosition = () => {
    if (!targetPosition) return {};

    const offset = 20;
    const arrowSize = 40;
    const tooltipMaxWidth = 400;
    const tooltipHeight = 300;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let position: any = {};

    switch (step.position) {
      case 'bottom':
        position = {
          top: targetPosition.top + targetPosition.height + offset + arrowSize,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%)'
        };
        if (position.top + tooltipHeight > viewportHeight) {
          position.top = targetPosition.top - offset - arrowSize;
          position.transform = 'translateX(-50%) translateY(-100%)';
        }
        break;
      case 'top':
        position = {
          top: targetPosition.top - offset - arrowSize,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%) translateY(-100%)'
        };
        if (position.top - tooltipHeight < 0) {
          position.top = targetPosition.top + targetPosition.height + offset + arrowSize;
          position.transform = 'translateX(-50%)';
        }
        break;
      case 'left':
        position = {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - offset - arrowSize,
          transform: 'translateY(-50%) translateX(-100%)'
        };
        break;
      case 'right':
        position = {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + offset + arrowSize,
          transform: 'translateY(-50%)'
        };
        break;
      default:
        return {};
    }

    if (position.left) {
      const estimatedLeft = position.transform?.includes('translateX(-50%)')
        ? position.left - tooltipMaxWidth / 2
        : position.left;

      if (estimatedLeft < 20) {
        position.left = tooltipMaxWidth / 2 + 20;
      } else if (estimatedLeft + tooltipMaxWidth > viewportWidth - 20) {
        position.left = viewportWidth - tooltipMaxWidth / 2 - 20;
      }
    }

    return position;
  };

  const getArrowPosition = () => {
    if (!targetPosition) return {};

    const arrowSize = 40;
    const offset = 10;

    let arrowPos: any = {};

    switch (step.arrowDirection) {
      case 'down':
        arrowPos = {
          top: targetPosition.top - arrowSize - offset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%)'
        };
        break;
      case 'up':
        arrowPos = {
          top: targetPosition.top + targetPosition.height + offset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%) rotate(180deg)'
        };
        break;
      case 'right':
        arrowPos = {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - arrowSize - offset,
          transform: 'translateY(-50%) rotate(-90deg)'
        };
        break;
      case 'left':
        arrowPos = {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + offset,
          transform: 'translateY(-50%) rotate(90deg)'
        };
        break;
      default:
        return {};
    }

    return arrowPos;
  };

  return (
    <>
      <style>{`
        @keyframes simple-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce-simple {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .onboarding-highlight {
          animation: simple-pulse 2s infinite;
          pointer-events: none;
        }

        .onboarding-arrow {
          animation: bounce-simple 1.5s infinite;
        }

        .onboarding-tooltip {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Затемнение фона */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Подсветка элемента */}
        <div
          className="absolute onboarding-highlight rounded-lg border-2 border-cyan-400"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
            pointerEvents: 'auto'
          }}
        />

        {/* Анимированная стрелка */}
        <div
          className="absolute onboarding-arrow z-[9999]"
          style={getArrowPosition()}
        >
          <ArrowDown className="text-cyan-400 text-4xl" />
        </div>

        {/* Подсказка */}
        <div
          className="absolute onboarding-tooltip pointer-events-auto"
          style={getTooltipPosition()}
        >
          <div className="bg-gray-900 rounded-xl p-6 max-w-md border border-cyan-400">
            {/* Кнопка закрытия */}
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Заголовок */}
            <h3 className="text-white text-xl font-bold mb-3 pr-6 flex items-center">
              {getStepIcon(step.id)}
              {step.title}
            </h3>

            {/* Описание */}
            <p className="text-gray-300 mb-6">
              {step.description}
            </p>

            {/* Прогресс */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      index === currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            {/* Кнопки */}
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {t('onboarding.skip', 'Пропустить')}
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors"
              >
                {currentStep < steps.length - 1 ? t('onboarding.next', 'Далее') : t('onboarding.finish', 'Завершить')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
