export const strikeAnimationStyles = `
  /* ПРИНУДИТЕЛЬНОЕ ОТКЛЮЧЕНИЕ БРАУЗЕРНЫХ ФИЛЬТРОВ ДЛЯ АНИМАЦИЙ */
  .case-preview-modal,
  .case-preview-modal * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    forced-color-adjust: none !important;
    color-scheme: only light !important;
  }

  /* ОПТИМИЗИРОВАННЫЕ АНИМАЦИИ - используем только transform и opacity для GPU acceleration */

  @-webkit-keyframes item-glow-pulse {
    0%, 100% {
      -webkit-filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
      filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
      border-color: rgb(34, 197, 94);
    }
    50% {
      -webkit-filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
      filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
      border-color: rgb(239, 68, 68);
    }
  }

  @keyframes item-glow-pulse {
    0%, 100% {
      -webkit-filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
      filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
      border-color: rgb(34, 197, 94);
    }
    50% {
      -webkit-filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
      filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
      border-color: rgb(239, 68, 68);
    }
  }

  @-webkit-keyframes spin-blur {
    0%, 100% {
      -webkit-filter: blur(0px);
      filter: blur(0px);
    }
    50% {
      -webkit-filter: blur(2px);
      filter: blur(2px);
    }
  }

  @keyframes spin-blur {
    0%, 100% {
      -webkit-filter: blur(0px);
      filter: blur(0px);
    }
    50% {
      -webkit-filter: blur(2px);
      filter: blur(2px);
    }
  }

  @-webkit-keyframes fake-slow-pulse {
    0%, 100% {
      -webkit-filter: brightness(1);
      filter: brightness(1);
    }
    50% {
      -webkit-filter: brightness(1.3);
      filter: brightness(1.3);
    }
  }

  @keyframes fake-slow-pulse {
    0%, 100% {
      -webkit-filter: brightness(1);
      filter: brightness(1);
    }
    50% {
      -webkit-filter: brightness(1.3);
      filter: brightness(1.3);
    }
  }

  @-webkit-keyframes wobble-glow {
    0%, 100% {
      -webkit-box-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
      box-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
    }
    50% {
      -webkit-box-shadow: 0 0 35px rgba(251, 146, 60, 1), 0 0 60px rgba(251, 146, 60, 0.6);
      box-shadow: 0 0 35px rgba(251, 146, 60, 1), 0 0 60px rgba(251, 146, 60, 0.6);
    }
  }

  @keyframes wobble-glow {
    0%, 100% {
      -webkit-box-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
      box-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(251, 146, 60, 0.4);
    }
    50% {
      -webkit-box-shadow: 0 0 35px rgba(251, 146, 60, 1), 0 0 60px rgba(251, 146, 60, 0.6);
      box-shadow: 0 0 35px rgba(251, 146, 60, 1), 0 0 60px rgba(251, 146, 60, 0.6);
    }
  }

  .animate-wobble {
    -webkit-animation: wobble-glow 0.5s ease-in-out infinite;
    animation: wobble-glow 0.5s ease-in-out infinite;
    will-change: box-shadow;
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

  @-webkit-keyframes win-flash {
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

  @-webkit-keyframes win-shake {
    0%, 100% {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    10%, 30%, 50%, 70%, 90% {
      -webkit-transform: translate3d(-4px, 0, 0);
      transform: translate3d(-4px, 0, 0);
    }
    20%, 40%, 60%, 80% {
      -webkit-transform: translate3d(4px, 0, 0);
      transform: translate3d(4px, 0, 0);
    }
  }

  @keyframes win-shake {
    0%, 100% {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    10%, 30%, 50%, 70%, 90% {
      -webkit-transform: translate3d(-4px, 0, 0);
      transform: translate3d(-4px, 0, 0);
    }
    20%, 40%, 60%, 80% {
      -webkit-transform: translate3d(4px, 0, 0);
      transform: translate3d(4px, 0, 0);
    }
  }

  @-webkit-keyframes expanding-ring {
    0% {
      -webkit-transform: scale(0.8);
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      -webkit-transform: scale(2.5);
      transform: scale(2.5);
      opacity: 0;
    }
  }

  @keyframes expanding-ring {
    0% {
      -webkit-transform: scale(0.8);
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      -webkit-transform: scale(2.5);
      transform: scale(2.5);
      opacity: 0;
    }
  }

  @-webkit-keyframes item-pop {
    0% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    30% {
      -webkit-transform: scale(1.15);
      transform: scale(1.15);
    }
    50% {
      -webkit-transform: scale(0.95);
      transform: scale(0.95);
    }
    70% {
      -webkit-transform: scale(1.08);
      transform: scale(1.08);
    }
    100% {
      -webkit-transform: scale(1.05);
      transform: scale(1.05);
    }
  }

  @keyframes item-pop {
    0% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    30% {
      -webkit-transform: scale(1.15);
      transform: scale(1.15);
    }
    50% {
      -webkit-transform: scale(0.95);
      transform: scale(0.95);
    }
    70% {
      -webkit-transform: scale(1.08);
      transform: scale(1.08);
    }
    100% {
      -webkit-transform: scale(1.05);
      transform: scale(1.05);
    }
  }

  @-webkit-keyframes particle-burst {
    0% {
      -webkit-transform: translate3d(0, 0, 0) scale(1);
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    100% {
      -webkit-transform: translate3d(var(--tx), var(--ty), 0) scale(0);
      transform: translate3d(var(--tx), var(--ty), 0) scale(0);
      opacity: 0;
    }
  }

  @keyframes particle-burst {
    0% {
      -webkit-transform: translate3d(0, 0, 0) scale(1);
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    100% {
      -webkit-transform: translate3d(var(--tx), var(--ty), 0) scale(0);
      transform: translate3d(var(--tx), var(--ty), 0) scale(0);
      opacity: 0;
    }
  }

  @-webkit-keyframes light-ray {
    0% {
      -webkit-transform: rotate(0deg) scale(0);
      transform: rotate(0deg) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      -webkit-transform: rotate(180deg) scale(1.5);
      transform: rotate(180deg) scale(1.5);
      opacity: 0;
    }
  }

  @keyframes light-ray {
    0% {
      -webkit-transform: rotate(0deg) scale(0);
      transform: rotate(0deg) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      -webkit-transform: rotate(180deg) scale(1.5);
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
    -webkit-animation: win-flash 0.6s ease-out forwards;
    animation: win-flash 0.6s ease-out forwards;
  }

  .win-shake {
    -webkit-animation: win-shake 0.5s ease-in-out forwards;
    animation: win-shake 0.5s ease-in-out forwards;
  }

  .expanding-ring {
    position: absolute;
    inset: -20%;
    border: 3px solid;
    border-radius: 16px;
    pointer-events: none;
    -webkit-animation: expanding-ring 1s ease-out forwards;
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
    -webkit-animation: item-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation: item-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .particle-burst {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    pointer-events: none;
    -webkit-animation: particle-burst 1.2s ease-out forwards;
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
    -webkit-transform-origin: center;
    transform-origin: center;
    -webkit-animation: light-ray 2s ease-out forwards;
    animation: light-ray 2s ease-out forwards;
  }

  @-webkit-keyframes golden-spark {
    0% {
      -webkit-transform: translate3d(0, 0, 0) scale(1);
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    100% {
      -webkit-transform: translate3d(var(--dx), var(--dy), 0) scale(0);
      transform: translate3d(var(--dx), var(--dy), 0) scale(0);
      opacity: 0;
    }
  }

  @keyframes golden-spark {
    0% {
      -webkit-transform: translate3d(0, 0, 0) scale(1);
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
    100% {
      -webkit-transform: translate3d(var(--dx), var(--dy), 0) scale(0);
      transform: translate3d(var(--dx), var(--dy), 0) scale(0);
      opacity: 0;
    }
  }

  @-webkit-keyframes victory-glow {
    0%, 100% {
      -webkit-filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
    }
    50% {
      -webkit-filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
      filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
    }
  }

  @keyframes victory-glow {
    0%, 100% {
      -webkit-filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
    }
    50% {
      -webkit-filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
      filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
    }
  }

  @keyframes svg-line-draw-1 {
    0% {
      stroke-dashoffset: 113;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  @keyframes svg-line-draw-2 {
    0% {
      stroke-dashoffset: 113;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
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
      transform: scale(0) rotate(-180deg);
    }
    50% {
      transform: scale(1.3) rotate(10deg);
    }
    70% {
      transform: scale(0.9) rotate(-5deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  .animate-item-glow {
    -webkit-animation: item-glow-pulse 3s ease-in-out infinite;
    animation: item-glow-pulse 3s ease-in-out infinite;
    will-change: filter, border-color;
  }

  .animate-svg-line-1 {
    animation: svg-line-draw-1 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }

  .animate-svg-line-2 {
    animation: svg-line-draw-2 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    animation-delay: 0.25s;
  }

  .animate-overlay-fade {
    animation: overlay-fade-in 0.4s ease-out forwards;
  }

  .animate-checkmark-bounce {
    animation: checkmark-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    animation-delay: 0.8s;
  }

  .golden-spark {
    position: absolute;
    width: 6px;
    height: 6px;
    background: radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    -webkit-animation: golden-spark 1s ease-out forwards;
    animation: golden-spark 1s ease-out forwards;
    will-change: transform, opacity;
  }

  .victory-glow {
    -webkit-animation: victory-glow 2s ease-in-out;
    animation: victory-glow 2s ease-in-out;
    will-change: filter;
  }

  /* КРИТИЧЕСКАЯ ОПТИМИЗАЦИЯ GPU */
  .gpu-layer {
    will-change: transform, opacity;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000px;
    perspective: 1000px;
  }

  .no-gpu-layer {
    will-change: auto;
    -webkit-transform: none;
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
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  /* Скрытие полосы прокрутки (скролл остаётся рабочим) */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Полоска предметов при открытии кейса — снижает лаги на iPhone */
  .case-open-strip {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    contain: layout style;
  }

  /* will-change только во время движения, чтобы не держать слой после остановки */
  .case-open-strip.case-open-strip-moving {
    will-change: transform;
    -webkit-will-change: transform;
  }

  /* Оптимизация изображений */
  .optimized-image {
    image-rendering: -webkit-optimize-contrast;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  /* Анимация появления модального окна информации о предмете */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
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
