import React from 'react';
import { ReceivedIcon } from '../../icons';

interface ItemStrikeThroughOverlayProps {
  /** Анимированное появление линий (как на карусели при выигрыше) */
  animated?: boolean;
  /** Зелёная метка «уже получено» */
  showCheckmark?: boolean;
  className?: string;
}

const ItemStrikeThroughOverlay: React.FC<ItemStrikeThroughOverlayProps> = ({
  animated = true,
  showCheckmark = true,
  className = '',
}) => (
  <div className={`absolute inset-0 z-20 rounded overflow-hidden pointer-events-none ${className}`}>
    <div
      className={`absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 ${
        animated ? 'animate-overlay-fade' : ''
      }`}
    />
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="15"
        y1="15"
        x2="85"
        y2="85"
        stroke={animated ? '#ef4444' : '#dc2626'}
        strokeWidth={animated ? '4' : '3'}
        strokeLinecap="round"
        className={animated ? 'animate-svg-line-1' : ''}
        style={{
          filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.9))',
          strokeDasharray: animated ? '113' : undefined,
          strokeDashoffset: animated ? '0' : undefined,
        }}
      />
      <line
        x1="85"
        y1="15"
        x2="15"
        y2="85"
        stroke={animated ? '#ef4444' : '#dc2626'}
        strokeWidth={animated ? '4' : '3'}
        strokeLinecap="round"
        className={animated ? 'animate-svg-line-2' : ''}
        style={{
          filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.9))',
          strokeDasharray: animated ? '113' : undefined,
          strokeDashoffset: animated ? '0' : undefined,
        }}
      />
    </svg>
    {showCheckmark && animated && (
      <div className="absolute top-2 right-2 animate-checkmark-bounce">
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white text-sm px-2.5 py-1 rounded-full font-bold shadow-lg border-2 border-green-300">
          <ReceivedIcon className="w-4 h-4" />
        </div>
      </div>
    )}
  </div>
);

export default ItemStrikeThroughOverlay;
