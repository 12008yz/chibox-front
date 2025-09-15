import React from 'react';

const FloatingWatermark: React.FC = () => {
  // Проверка на слабые устройства
  const isLowEndDevice = () => {
    // Проверяем размер экрана и производительность
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
    const isSlowDevice = navigator.hardwareConcurrency <= 2;
    const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;

    return isSmallScreen || isSlowDevice || hasLowMemory;
  };

  // На слабых устройствах не показываем водяной знак
  if (isLowEndDevice()) {
    return null;
  }

  // Значительно упрощенный водяной знак только для мощных устройств
  const cs2Icons = [
    'https://ext.same-assets.com/609624232/571014729.png',
    'https://ext.same-assets.com/609624232/1178601660.png',
  ];

  const createSimpleWatermark = () => {
    // Только 2 элемента вместо множества
    return cs2Icons.map((icon, index) => (
      <img
        key={index}
        src={icon}
        alt=""
        className="absolute select-none pointer-events-none"
        style={{
          left: `${index * 900}px`,
          top: `${index * 500}px`,
          width: '40px', // Уменьшено
          height: '40px',
          opacity: 0.015, // Еще меньше
          filter: 'grayscale(100%)',
          willChange: 'auto', // Отключить GPU ускорение
          transform: 'rotate(-15deg)', // Статичный поворот без анимации
        }}
      />
    ));
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="relative w-full h-full min-h-screen">
        {createSimpleWatermark()}
      </div>
    </div>
  );
};

export default FloatingWatermark;
