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

  @keyframes spin-blur {
    0%, 100% {
      filter: blur(0px);
    }
    50% {
      filter: blur(2px);
    }
  }

  @keyframes fake-slow-pulse {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.3);
    }
  }

  @keyframes speed-up-flash {
    0% {
      filter: brightness(1);
    }
    30% {
      filter: brightness(1.5) saturate(1.3);
    }
    100% {
      filter: brightness(1);
    }
  }

  @keyframes container-pulse {
    0%, 100% {
      box-shadow: inset 0 0 10px rgba(234, 179, 8, 0.3);
    }
    50% {
      box-shadow: inset 0 0 20px rgba(234, 179, 8, 0.6);
    }
  }

  .spinning-container {
    animation: container-pulse 0.8s ease-in-out infinite;
  }

  /* КРУТЫЕ ЭФФЕКТЫ ПОБЕДЫ */

  @keyframes win-flash {
    0% {
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    30% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes win-shake {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translate3d(-4px, 0, 0);
    }
    20%, 40%, 60%, 80% {
      transform: translate3d(4px, 0, 0);
    }
  }

  @keyframes expanding-ring {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }

  @keyframes item-pop {
    0% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.15);
    }
    50% {
      transform: scale(0.95);
    }
    70% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1.05);
    }
  }

  @keyframes particle-burst {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate3d(var(--tx), var(--ty), 0) scale(0);
      opacity: 0;
    }
  }

  @keyframes light-ray {
    0% {
      transform: rotate(0deg) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      transform: rotate(180deg) scale(1.5);
      opacity: 0;
    }
  }

  .win-flash-overlay {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.4), transparent 70%);
    pointer-events: none;
    z-index: 9998;
    animation: win-flash 0.6s ease-out forwards;
  }

  .win-shake {
    animation: win-shake 0.5s ease-in-out forwards;
  }

  .expanding-ring {
    position: absolute;
    inset: -20%;
    border: 3px solid;
    border-radius: 16px;
    pointer-events: none;
    animation: expanding-ring 1s ease-out forwards;
  }

  .expanding-ring:nth-child(1) {
    border-color: rgba(251, 191, 36, 0.8);
    animation-delay: 0s;
  }

  .expanding-ring:nth-child(2) {
    border-color: rgba(168, 85, 247, 0.6);
    animation-delay: 0.15s;
  }

  .expanding-ring:nth-child(3) {
    border-color: rgba(59, 130, 246, 0.4);
    animation-delay: 0.3s;
  }

  .item-pop-animation {
    animation: item-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .particle-burst {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    pointer-events: none;
    animation: particle-burst 1.2s ease-out forwards;
  }

  .light-ray {
    position: absolute;
    width: 200%;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
    pointer-events: none;
    left: -50%;
    top: 50%;
    transform-origin: center;
    animation: light-ray 2s ease-out forwards;
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
