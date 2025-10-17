export const strikeAnimationStyles = `
  /* ОПТИМИЗИРОВАННЫЕ АНИМАЦИИ - используем только transform и opacity для GPU acceleration */

  @keyframes item-glow-pulse {
    0%, 100% {
      filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
      border-color: rgb(34, 197, 94);
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
      border-color: rgb(239, 68, 68);
    }
  }

  @keyframes golden-spark {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate3d(var(--dx), var(--dy), 0) scale(0);
      opacity: 0;
    }
  }

  @keyframes victory-glow {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
    }
    50% {
      filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
    }
  }

  @keyframes cross-line-draw {
    0% {
      transform: scaleX(0);
      opacity: 0;
    }
    100% {
      transform: scaleX(1);
      opacity: 1;
    }
  }

  @keyframes cross-line-draw-reverse {
    0% {
      transform: scaleX(0);
      opacity: 0;
    }
    100% {
      transform: scaleX(1);
      opacity: 1;
    }
  }

  @keyframes overlay-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes checkmark-bounce {
    0% {
      opacity: 0;
      transform: scale3d(0, 0, 1);
    }
    50% {
      transform: scale3d(1.2, 1.2, 1);
    }
    100% {
      opacity: 1;
      transform: scale3d(1, 1, 1);
    }
  }

  .animate-item-glow {
    animation: item-glow-pulse 3s ease-in-out infinite;
    will-change: filter, border-color;
  }

  .animate-cross-line-1 {
    animation: cross-line-draw 0.6s ease-out forwards;
    width: 70%;
    height: 4px;
    transform-origin: left center;
  }

  .animate-cross-line-2 {
    animation: cross-line-draw-reverse 0.6s ease-out forwards;
    animation-delay: 0.3s;
    width: 70%;
    height: 4px;
    transform-origin: left center;
  }

  .animate-overlay-fade {
    animation: overlay-fade-in 0.4s ease-out forwards;
  }

  .animate-checkmark-bounce {
    animation: checkmark-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    animation-delay: 1s;
  }

  .golden-spark {
    position: absolute;
    width: 6px;
    height: 6px;
    background: radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    animation: golden-spark 1s ease-out forwards;
    will-change: transform, opacity;
  }

  .victory-glow {
    animation: victory-glow 2s ease-in-out;
    will-change: filter;
  }

  /* КРИТИЧЕСКАЯ ОПТИМИЗАЦИЯ GPU */
  .gpu-layer {
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .no-gpu-layer {
    will-change: auto;
    transform: none;
  }

  /* Оптимизация для виртуализированного скролла */
  .virtualized-container {
    contain: layout style paint;
    content-visibility: auto;
  }

  .item-container {
    contain: layout style paint;
    content-visibility: auto;
  }

  /* Плавный скролл с hardware acceleration */
  .smooth-scroll {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    transform: translate3d(0, 0, 0);
  }

  /* Оптимизация изображений */
  .optimized-image {
    image-rendering: -webkit-optimize-contrast;
    transform: translate3d(0, 0, 0);
  }
`;

// Добавляем стили в head только один раз
export const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.head.querySelector('style[data-case-modal-styles]')) {
    const styleElement = document.createElement('style');
    styleElement.textContent = strikeAnimationStyles;
    styleElement.setAttribute('data-case-modal-styles', 'true');
    document.head.appendChild(styleElement);
  }
};
