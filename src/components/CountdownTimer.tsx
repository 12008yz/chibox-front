import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime: string; // ISO строка времени до которого считаем
  onComplete?: () => void; // Колбэк при завершении отсчета
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTime,
  onComplete,
  className = ""
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime).getTime();
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });

        if (onComplete) {
          onComplete();
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };

    // Расчет сразу
    calculateTimeLeft();

    // Обновляем каждую секунду
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  if (timeLeft.isExpired) {
    return (
      <span className={`text-green-400 ${className}`}>
        🔄 Доступно!
      </span>
    );
  }

  return (
    <span className={`font-mono ${className}`}>
      {timeLeft.hours > 0 && (
        <>
          {formatNumber(timeLeft.hours)}
          <span className="text-gray-400">ч</span>
          {" "}
        </>
      )}
      {formatNumber(timeLeft.minutes)}
      <span className="text-gray-400">м</span>
      {" "}
      {formatNumber(timeLeft.seconds)}
      <span className="text-gray-400">с</span>
    </span>
  );
};

export default CountdownTimer;
