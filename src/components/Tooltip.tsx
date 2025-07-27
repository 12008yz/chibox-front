import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 280; // Увеличена ширина для лучшего отображения
      const tooltipHeight = 200; // Увеличена высота

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - 10;
          left = rect.left + (rect.width - tooltipWidth) / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + (rect.width - tooltipWidth) / 2;
          break;
        case 'left':
          top = rect.top + (rect.height - tooltipHeight) / 2;
          left = rect.left - tooltipWidth - 10;
          break;
        case 'right':
          top = rect.top + (rect.height - tooltipHeight) / 2;
          left = rect.right + 10;
          break;
      }

      // Проверяем границы экрана и корректируем позицию
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      if (top < 10) top = 10;
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = window.innerHeight - tooltipHeight - 10;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  const tooltipElement = isVisible ? (
    <div
      className="fixed bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-2xl border border-gray-600 min-w-[260px] max-w-sm backdrop-blur-sm"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 99999999, // Увеличен z-index
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {content}
      {/* Стрелочка для tooltip */}
      <div
        className={`absolute w-0 h-0 border-4 ${
          position === 'bottom' 
            ? 'border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent -top-2 left-1/2 transform -translate-x-1/2'
            : position === 'top'
            ? 'border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent -bottom-2 left-1/2 transform -translate-x-1/2'
            : position === 'right'
            ? 'border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent -left-2 top-1/2 transform -translate-y-1/2'
            : 'border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent -right-2 top-1/2 transform -translate-y-1/2'
        }`}
      />
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};

export default Tooltip;