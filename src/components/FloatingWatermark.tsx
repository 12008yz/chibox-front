import React from 'react';

const FloatingWatermark: React.FC = () => {
  // Массив иконок CS2 из icons8
  const cs2Icons = [
    'https://ext.same-assets.com/609624232/3169792146.png', // CS soldier icon
    'https://ext.same-assets.com/609624232/355601599.png', // CS soldier with rifle
    'https://ext.same-assets.com/609624232/226050672.png', // CS soldier variant
    'https://ext.same-assets.com/609624232/144393961.png', // CS soldier action
    'https://ext.same-assets.com/609624232/2525981327.png', // CS soldier standing
    'https://ext.same-assets.com/609624232/1178601660.png', // CS soldier crouching
  ];

  // Создаем массив для повторения иконок
  const createWatermarkPattern = () => {
    const pattern = [];
    const rows = 4; // ещё больше уменьшено количество строк
    const cols = 3; // ещё больше уменьшено количество колонок

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Добавляем смещение для шахматного расположения
        const offsetX = row % 2 === 0 ? 0 : 300;

        // Выбираем случайную иконку
        const randomIcon = cs2Icons[Math.floor(Math.random() * cs2Icons.length)];

        pattern.push(
          <img
            key={`${row}-${col}`}
            src={randomIcon}
            alt=""
            className="absolute select-none pointer-events-none transform -rotate-12"
            style={{
              left: `${col * 600 + offsetX}px`,
              top: `${row * 300}px`,
              width: '80px',
              height: '80px',
              opacity: 0.04,
              filter: 'grayscale(100%)',
              animationDelay: `${(row + col) * 0.5}s`,
            }}
          />
        );
      }
    }
    return pattern;
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="relative w-full h-full min-h-screen">
        {createWatermarkPattern()}
      </div>
    </div>
  );
};

export default FloatingWatermark;
