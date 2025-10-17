export const strikeAnimationStyles = `
  @keyframes item-glow-pulse {
    0%, 100% {
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
      border-color: rgb(34, 197, 94);
    }
    50% {
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
      border-color: rgb(239, 68, 68);
    }
  }

  @keyframes golden-spark {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(var(--dx), var(--dy)) scale(0);
      opacity: 0;
    }
  }

  @keyframes victory-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    }
  }

  @keyframes cross-line-draw {
    0% {
      width: 0;
      height: 0;
      opacity: 0;
    }
    100% {
      width: 70%;
      height: 4px;
      opacity: 1;
    }
  }

  @keyframes cross-line-draw-reverse {
    0% {
      width: 0;
      height: 0;
      opacity: 0;
    }
    100% {
      width: 70%;
      height: 4px;
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
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-item-glow {
    animation: item-glow-pulse 3s ease-in-out infinite;
  }

  .animate-cross-line-1 {
    animation: cross-line-draw 0.6s ease-out forwards;
  }

  .animate-cross-line-2 {
    animation: cross-line-draw-reverse 0.6s ease-out forwards;
    animation-delay: 0.3s;
  }

  .animate-overlay-fade {
    animation: overlay-fade-in 0.4s ease-out forwards;
  }

  .animate-checkmark-bounce {
    animation: checkmark-bounce 0.5s ease-out forwards;
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
  }

  .victory-glow {
    animation: victory-glow 2s ease-in-out;
  }

  /* Оптимизация производительности */
  .gpu-layer {
    will-change: transform;
    transform: translateZ(0);
  }

  .no-gpu-layer {
    will-change: auto;
    transform: none;
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
