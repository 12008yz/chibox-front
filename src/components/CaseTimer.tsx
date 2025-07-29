import React, { useState, useEffect } from 'react';

interface CaseTimerProps {
  nextAvailableTime?: string | null;
  className?: string;
}

const CaseTimer: React.FC<CaseTimerProps> = ({ nextAvailableTime, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

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
        setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}м ${seconds}с`);
      } else {
        setTimeLeft(`${seconds}с`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextAvailableTime]);

  if (isAvailable) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-green-400 text-sm font-medium">Кейсы доступны</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
      <span className="text-orange-400 text-sm font-medium">
        Новые кейсы через: <span className="text-white font-mono">{timeLeft}</span>
      </span>
      <span className="text-gray-500 text-xs ml-2">(ежедневно в 8:37 МСК)</span>
    </div>
  );
};

export default CaseTimer;
