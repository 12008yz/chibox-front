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
  const itemsPerRow = 6;
  const rowHeight = itemHeight + 16;
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;

  // Вычисляем видимые элементы
  const visibleRowStart = Math.floor(scrollTop / rowHeight);
  const visibleRowEnd = Math.min(totalRows, visibleRowStart + Math.ceil(containerHeight / rowHeight) + 2);
  const startIndex = visibleRowStart * itemsPerRow;
  const endIndex = Math.min(items.length, visibleRowEnd * itemsPerRow);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-4"
          style={{
            transform: `translateY(${visibleRowStart * rowHeight}px)`,
            position: 'absolute',
            width: '100%'
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
