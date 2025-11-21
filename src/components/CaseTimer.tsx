import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface CaseTimerProps {
  nextAvailableTime?: string | null;
  className?: string;
}

const CaseTimer: React.FC<CaseTimerProps> = ({ nextAvailableTime, className = '' }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для остановки обновлений когда компонент не виден
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nextAvailableTime) {
      setIsAvailable(true);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const targetTime = new Date(nextAvailableTime).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsAvailable(true);
        setTimeLeft('');
        return;
      }

      setIsAvailable(false);

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}${t('common.hours_short')} ${minutes}${t('common.minutes_short')} ${seconds}${t('common.seconds_short')}`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}${t('common.minutes_short')} ${seconds}${t('common.seconds_short')}`);
      } else {
        setTimeLeft(`${seconds}${t('common.seconds_short')}`);
      }
    };

    updateTimer();

    // Обновляем таймер только если компонент виден
    const interval = setInterval(() => {
      if (isVisible) {
        updateTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAvailableTime, isVisible, t]);

  if (isAvailable) {
    return (
      <div ref={containerRef} className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
        <span className="text-green-400 text-sm font-medium">{t('common.cases_available')}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`inline-flex flex-col items-center space-y-1 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 ${className}`}>
      <div className="hidden md:flex items-center space-x-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full pulse-dot" />
        <span className="text-orange-400 text-xs font-medium uppercase tracking-wide">
          {t('common.next_case')}
        </span>
      </div>
      <span className="text-white text-sm md:text-base font-mono font-bold">{timeLeft}</span>
    </div>
  );
};

export default CaseTimer;
