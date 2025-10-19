import React, { memo, useState, useRef, useCallback } from 'react';
import { StaticCaseItem } from './StaticCaseItem';
import { VirtualizedGridProps } from '../types';

export const VirtualizedGrid = memo(({
  items,
  itemHeight = 200,
  containerHeight = 600,
  getRarityColor,
  t
}: VirtualizedGridProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Вычисляем параметры виртуализации
  const itemsPerRow = 6; // соответствует grid-cols-6 на средних экранах
  const rowHeight = itemHeight + 16; // высота элемента + gap
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;

  // Вычисляем видимые элементы
  const visibleRowStart = Math.floor(scrollTop / rowHeight);
  const visibleRowEnd = Math.min(totalRows, visibleRowStart + Math.ceil(containerHeight / rowHeight) + 2);
  const startIndex = visibleRowStart * itemsPerRow;
  const endIndex = Math.min(items.length, visibleRowEnd * itemsPerRow);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      setScrollTop(scrollTop);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative', width: '100%' }}>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4"
          style={{
            transform: `translateY(${visibleRowStart * rowHeight}px)`,
            position: 'absolute',
            width: '100%',
            willChange: 'transform'
          }}
        >
          {items.slice(startIndex, endIndex).map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <StaticCaseItem
                key={item.id || actualIndex}
                item={item}
                getRarityColor={getRarityColor}
                t={t}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';
