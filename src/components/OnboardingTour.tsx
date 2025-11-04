import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowDown, FaArrowRight, FaTimes } from 'react-icons/fa';

interface OnboardingStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrowDirection: 'down' | 'right' | 'up' | 'left';
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isActive, onComplete }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: OnboardingStep[] = [
    {
      id: 'cases',
      targetId: 'onboarding-cases',
      title: t('onboarding.cases_title', 'Кейсы'),
      description: t('onboarding.cases_description', 'Нажмите на кейс, чтобы посмотреть что внутри и открыть его!'),
      position: 'bottom',
      arrowDirection: 'down'
    },
    {
      id: 'deposit',
      targetId: 'onboarding-deposit-button',
      title: t('onboarding.deposit_title', 'Пополнение баланса'),
      description: t('onboarding.deposit_description', 'Здесь вы можете пополнить баланс для покупки премиум кейсов, а так же покупка статуса. Покупая статус вы получаете бесплатные кейсы на протяжении всей вашей активности.'),
      position: 'bottom',
      arrowDirection: 'down'
    }
  ];

  useEffect(() => {
    if (!isActive) return;

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
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isActive || !targetPosition) return null;

  const step = steps[currentStep];

  const getTooltipPosition = () => {
    if (!targetPosition) return {};

    const offset = 20;
    const arrowSize = 40;

    switch (step.position) {
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + offset + arrowSize,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'top':
        return {
          top: targetPosition.top - offset - arrowSize,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%) translateY(-100%)'
        };
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - offset - arrowSize,
          transform: 'translateY(-50%) translateX(-100%)'
        };
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + offset + arrowSize,
          transform: 'translateY(-50%)'
        };
      default:
        return {};
    }
  };

  const getArrowPosition = () => {
    if (!targetPosition) return {};

    const arrowSize = 40;
    const offset = 10;

    switch (step.arrowDirection) {
      case 'down':
        return {
          top: targetPosition.top - arrowSize - offset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'up':
        return {
          top: targetPosition.top + targetPosition.height + offset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%) rotate(180deg)'
        };
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - arrowSize - offset,
          transform: 'translateY(-50%) rotate(-90deg)'
        };
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + offset,
          transform: 'translateY(-50%) rotate(90deg)'
        };
      default:
        return {};
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px 5px rgba(34, 211, 238, 0.6);
          }
          50% {
            box-shadow: 0 0 30px 10px rgba(34, 211, 238, 0.9);
          }
        }

        @keyframes bounce-arrow-down {
          0%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-15px) translateX(-50%);
          }
        }

        @keyframes bounce-arrow-right {
          0%, 100% {
            transform: translateX(0) translateY(-50%) rotate(-90deg);
          }
          50% {
            transform: translateX(-15px) translateY(-50%) rotate(-90deg);
          }
        }

        @keyframes bounce-arrow-left {
          0%, 100% {
            transform: translateX(0) translateY(-50%) rotate(90deg);
          }
          50% {
            transform: translateX(15px) translateY(-50%) rotate(90deg);
          }
        }

        @keyframes bounce-arrow-up {
          0%, 100% {
            transform: translateY(0) translateX(-50%) rotate(180deg);
          }
          50% {
            transform: translateY(15px) translateX(-50%) rotate(180deg);
          }
        }

        .onboarding-highlight {
          animation: pulse-glow 2s infinite;
          pointer-events: none;
        }

        .onboarding-arrow-down {
          animation: bounce-arrow-down 1.5s infinite;
        }

        .onboarding-arrow-right {
          animation: bounce-arrow-right 1.5s infinite;
        }

        .onboarding-arrow-left {
          animation: bounce-arrow-left 1.5s infinite;
        }

        .onboarding-arrow-up {
          animation: bounce-arrow-up 1.5s infinite;
        }

        .onboarding-tooltip {
          animation: fadeInScale 0.3s ease-out;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Затемнение фона */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Подсветка элемента */}
        <div
          className="absolute onboarding-highlight rounded-lg border-4 border-transparent bg-transparent"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
            pointerEvents: 'auto',
            borderImage: 'linear-gradient(135deg, #22d3ee, #3b82f6, #22d3ee) 1'
          }}
        />

        {/* Анимированная стрелка */}
        <div
          className={`absolute onboarding-arrow-${step.arrowDirection}`}
          style={getArrowPosition()}
        >
          <FaArrowDown className="text-cyan-400 text-5xl drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        </div>

        {/* Подсказка */}
        <div
          className="absolute onboarding-tooltip pointer-events-auto"
          style={getTooltipPosition()}
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 max-w-md border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            {/* Кнопка закрытия */}
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>

            {/* Заголовок */}
            <h3 className="text-white text-xl font-bold mb-3 pr-6">{step.title}</h3>

            {/* Описание */}
            <p className="text-gray-300 mb-6">{step.description}</p>

            {/* Прогресс */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all ${
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
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-cyan-500/50"
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
