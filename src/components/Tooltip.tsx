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
      const tooltipWidth = 240; // Примерная ширина tooltip
      const tooltipHeight = 120; // Примерная высота tooltip

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
      className="fixed bg-gray-800 text-white text-sm rounded-lg py-3 px-4 shadow-2xl border border-gray-600 min-w-[200px] max-w-sm backdrop-blur-sm"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 99999,
      }}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
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
