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
      border-color: rgb(34, 197, 94);
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      border-color: rgb(239, 68, 68);
      opacity: 0.9;
      -webkit-transform: scale(1.02);
      transform: scale(1.02);
    }
  }

  @keyframes item-glow-pulse {
    0%, 100% {
      border-color: rgb(34, 197, 94);
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      border-color: rgb(239, 68, 68);
      opacity: 0.9;
      -webkit-transform: scale(1.02);
      transform: scale(1.02);
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
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      opacity: 0.96;
      -webkit-transform: scale(1.006);
      transform: scale(1.006);
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

  /* Оверлей модалки кейса — всегда на весь экран */
  .case-preview-backdrop {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-width: 100vw !important;
    min-height: 100vh !important;
    min-height: 100dvh !important;
    isolation: isolate;
  }

  @-webkit-keyframes mobile-win-reveal {
    0% {
      opacity: 0;
      -webkit-transform: translate(-50%, -50%) scale(0.92);
      transform: translate(-50%, -50%) scale(0.92);
    }
    100% {
      opacity: 1;
      -webkit-transform: translate(-50%, -50%) scale(1);
      transform: translate(-50%, -50%) scale(1);
    }
  }
  @keyframes mobile-win-reveal {
    0% {
      opacity: 0;
      -webkit-transform: translate(-50%, -50%) scale(0.92);
      transform: translate(-50%, -50%) scale(0.92);
    }
    100% {
      opacity: 1;
      -webkit-transform: translate(-50%, -50%) scale(1);
      transform: translate(-50%, -50%) scale(1);
    }
  }
  .mobile-win-reveal {
    -webkit-animation: mobile-win-reveal 1s ease-out forwards;
    animation: mobile-win-reveal 1s ease-out forwards;
    -webkit-animation-delay: 0.6s;
    animation-delay: 0.6s;
    opacity: 0;
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
  @media (max-width: 1023px) {
    .light-ray {
      /* Сокращаем площадь и длительность лучей на mobile */
      width: 160%;
      left: -30%;
      opacity: 0.75;
      -webkit-animation: light-ray 1.3s ease-out forwards;
      animation: light-ray 1.3s ease-out forwards;
    }
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
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      opacity: 0.92;
      -webkit-transform: scale(1.015);
      transform: scale(1.015);
    }
  }

  @keyframes victory-glow {
    0%, 100% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      opacity: 0.92;
      -webkit-transform: scale(1.015);
      transform: scale(1.015);
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
    will-change: transform, opacity;
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
    will-change: transform, opacity;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.35), 0 0 12px rgba(255, 215, 0, 0.25);
  }
  @media (max-width: 1023px) {
    .victory-glow {
      /* Фоллбэк без filter-анимации: заметно и легче для GPU */
      -webkit-animation: none;
      animation: none;
      filter: none;
      box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.45), 0 0 14px rgba(255, 215, 0, 0.32);
    }
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

  /* Центральная зона: только transform (zoom), без анимации теней — меньше нагрузка на GPU */
  .case-open-viewport-frame {
    transition: transform 0.5s ease-out;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
  }
  .case-open-viewport-frame--highlight {
    transform: translate(-50%, -50%) scale(1.04);
    -webkit-transform: translate(-50%, -50%) scale(1.04);
    /* Одна тень без анимации — смена при добавлении класса, без transition */
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 146, 60, 0.35);
  }

  /* Уголки «здесь результат» — статичные границы, без анимации */
  .case-open-viewport-corner {
    position: absolute;
    width: 12px;
    height: 12px;
    border-color: rgba(251, 191, 36, 0.85);
    border-style: solid;
    border-width: 0;
    pointer-events: none;
  }
  .case-open-viewport-corner--tl {
    top: 4px;
    left: 4px;
    border-top-width: 2px;
    border-left-width: 2px;
  }
  .case-open-viewport-corner--tr {
    top: 4px;
    right: 4px;
    border-top-width: 2px;
    border-right-width: 2px;
  }
  .case-open-viewport-corner--bl {
    bottom: 4px;
    left: 4px;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }
  .case-open-viewport-corner--br {
    bottom: 4px;
    right: 4px;
    border-bottom-width: 2px;
    border-right-width: 2px;
  }

  /* Мягкое затухание краёв ленты (маска на контенте) */
  .case-open-viewport-fade {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  }

  /* Виньетка + янтарное свечение к центру — поверх ленты, pointer-events: none в разметке */
  .case-open-viewport-overlay {
    z-index: 6;
    background:
      linear-gradient(90deg, rgba(8, 5, 18, 0.94) 0%, rgba(8, 5, 18, 0.25) 12%, transparent 22%, transparent 78%, rgba(8, 5, 18, 0.25) 88%, rgba(8, 5, 18, 0.94) 100%),
      radial-gradient(ellipse 42% 130% at 50% 50%, rgba(251, 191, 36, 0.11) 0%, transparent 62%);
    pointer-events: none;
  }
  @media (max-width: 1023px) {
    /* На mobile/tablet снижаем тяжесть перерисовки оверлея */
    .case-open-viewport-overlay {
      background:
        linear-gradient(90deg, rgba(8, 5, 18, 0.92) 0%, rgba(8, 5, 18, 0.3) 14%, transparent 24%, transparent 76%, rgba(8, 5, 18, 0.3) 86%, rgba(8, 5, 18, 0.92) 100%),
        radial-gradient(ellipse 40% 120% at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 58%);
    }
  }

  /* Появление полноэкранной рулетки после ухода превью */
  @keyframes case-open-roulette-enter {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .case-open-roulette-layer {
    animation: case-open-roulette-enter 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .case-open-roulette-layer {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }

  /* Неоновые скобки по краям рулетки (как тройные трубки); лента под ними (z-index) */
  .case-open-neon-bracket {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 32px;
    z-index: 11;
    pointer-events: none;
    opacity: 0.74;
  }
  .case-open-neon-bracket--left {
    left: 0;
  }
  .case-open-neon-bracket--right {
    right: 0;
  }
  .case-open-neon-bracket--desktop {
    width: 40px;
  }

  .case-open-neon-limb {
    position: absolute;
    pointer-events: none;
    border-radius: 2px;
  }

  /* Три параллельные «трубки»: вертикаль слева */
  .case-open-neon-limb--left-v {
    left: 3px;
    top: 9%;
    bottom: 9%;
    width: 11px;
    border-radius: 5px 2px 2px 5px;
    background: linear-gradient(
      90deg,
      rgba(255, 236, 200, 0.98) 0%,
      rgba(255, 236, 200, 0.98) 22%,
      rgba(255, 200, 120, 0.15) 26%,
      rgba(255, 180, 95, 1) 34%,
      rgba(255, 180, 95, 1) 52%,
      rgba(255, 140, 60, 0.2) 56%,
      rgba(255, 150, 75, 1) 64%,
      rgba(255, 150, 75, 1) 82%,
      rgba(230, 110, 40, 0.95) 100%
    );
    box-shadow:
      0 0 8px rgba(255, 170, 90, 0.95),
      0 0 18px rgba(255, 140, 55, 0.65),
      0 0 32px rgba(255, 120, 40, 0.4),
      -4px 0 14px rgba(255, 160, 80, 0.45);
  }
  .case-open-neon-limb--left-ht {
    left: 3px;
    top: 9%;
    width: 26px;
    height: 10px;
    border-radius: 5px 3px 2px 2px;
    background: linear-gradient(
      180deg,
      rgba(255, 236, 200, 0.98) 0%,
      rgba(255, 236, 200, 0.98) 24%,
      rgba(255, 200, 120, 0.12) 28%,
      rgba(255, 180, 95, 1) 36%,
      rgba(255, 180, 95, 1) 54%,
      rgba(255, 140, 60, 0.15) 58%,
      rgba(255, 150, 75, 1) 66%,
      rgba(255, 150, 75, 1) 84%,
      rgba(230, 110, 40, 0.95) 100%
    );
    box-shadow:
      0 0 8px rgba(255, 170, 90, 0.85),
      0 -2px 16px rgba(255, 150, 70, 0.45),
      4px -2px 12px rgba(255, 160, 80, 0.35);
  }
  .case-open-neon-limb--left-hb {
    left: 3px;
    bottom: 9%;
    width: 26px;
    height: 10px;
    border-radius: 2px 3px 5px 2px;
    background: linear-gradient(
      180deg,
      rgba(230, 110, 40, 0.95) 0%,
      rgba(255, 150, 75, 1) 16%,
      rgba(255, 150, 75, 1) 34%,
      rgba(255, 140, 60, 0.15) 42%,
      rgba(255, 180, 95, 1) 46%,
      rgba(255, 180, 95, 1) 64%,
      rgba(255, 200, 120, 0.12) 72%,
      rgba(255, 236, 200, 0.98) 76%,
      rgba(255, 236, 200, 0.98) 100%
    );
    box-shadow:
      0 0 8px rgba(255, 170, 90, 0.85),
      0 2px 16px rgba(255, 150, 70, 0.45),
      4px 2px 12px rgba(255, 160, 80, 0.35);
  }

  .case-open-neon-bracket--desktop .case-open-neon-limb--left-v {
    left: 4px;
    width: 13px;
  }
  .case-open-neon-bracket--desktop .case-open-neon-limb--left-ht,
  .case-open-neon-bracket--desktop .case-open-neon-limb--left-hb {
    left: 4px;
    width: 34px;
    height: 11px;
  }

  /* Правая скобка — циан */
  .case-open-neon-limb--right-v {
    right: 3px;
    top: 9%;
    bottom: 9%;
    width: 11px;
    border-radius: 2px 5px 5px 2px;
    background: linear-gradient(
      270deg,
      rgba(200, 250, 255, 0.98) 0%,
      rgba(200, 250, 255, 0.98) 22%,
      rgba(120, 230, 255, 0.15) 26%,
      rgba(56, 210, 240, 1) 34%,
      rgba(56, 210, 240, 1) 52%,
      rgba(20, 180, 220, 0.2) 56%,
      rgba(34, 200, 230, 1) 64%,
      rgba(34, 200, 230, 1) 82%,
      rgba(10, 150, 190, 0.95) 100%
    );
    box-shadow:
      0 0 8px rgba(80, 220, 255, 0.95),
      0 0 18px rgba(40, 200, 255, 0.65),
      0 0 32px rgba(20, 180, 240, 0.4),
      4px 0 14px rgba(60, 210, 255, 0.45);
  }
  .case-open-neon-limb--right-ht {
    right: 3px;
    top: 9%;
    width: 26px;
    height: 10px;
    border-radius: 3px 5px 2px 2px;
    background: linear-gradient(
      180deg,
      rgba(200, 250, 255, 0.98) 0%,
      rgba(200, 250, 255, 0.98) 24%,
      rgba(120, 230, 255, 0.12) 28%,
      rgba(56, 210, 240, 1) 36%,
      rgba(56, 210, 240, 1) 54%,
      rgba(20, 180, 220, 0.15) 58%,
      rgba(34, 200, 230, 1) 66%,
      rgba(34, 200, 230, 1) 84%,
      rgba(10, 150, 190, 0.95) 100%
    );
    box-shadow:
      0 0 8px rgba(80, 220, 255, 0.85),
      0 -2px 16px rgba(50, 200, 255, 0.45),
      -4px -2px 12px rgba(60, 210, 255, 0.35);
  }
  .case-open-neon-limb--right-hb {
    right: 3px;
    bottom: 9%;
    width: 26px;
    height: 10px;
    border-radius: 2px 2px 5px 3px;
    background: linear-gradient(
      180deg,
      rgba(10, 150, 190, 0.95) 0%,
      rgba(34, 200, 230, 1) 16%,
      rgba(34, 200, 230, 1) 34%,
      rgba(20, 180, 220, 0.15) 42%,
      rgba(56, 210, 240, 1) 46%,
      rgba(56, 210, 240, 1) 64%,
      rgba(120, 230, 255, 0.12) 72%,
      rgba(200, 250, 255, 0.98) 76%,
      rgba(200, 250, 255, 0.98) 100%
    );
    box-shadow:
      0 0 8px rgba(80, 220, 255, 0.85),
      0 2px 16px rgba(50, 200, 255, 0.45),
      -4px 2px 12px rgba(60, 210, 255, 0.35);
  }

  .case-open-neon-bracket--desktop .case-open-neon-limb--right-v {
    right: 4px;
    width: 13px;
  }
  .case-open-neon-bracket--desktop .case-open-neon-limb--right-ht,
  .case-open-neon-bracket--desktop .case-open-neon-limb--right-hb {
    right: 4px;
    width: 34px;
    height: 11px;
  }

  @media (prefers-reduced-motion: reduce) {
    .case-open-neon-limb--left-v,
    .case-open-neon-limb--left-ht,
    .case-open-neon-limb--left-hb,
    .case-open-neon-limb--right-v,
    .case-open-neon-limb--right-ht,
    .case-open-neon-limb--right-hb {
      box-shadow:
        0 0 6px rgba(255, 170, 90, 0.5),
        0 0 10px rgba(255, 140, 55, 0.35);
    }
    .case-open-neon-limb--right-v,
    .case-open-neon-limb--right-ht,
    .case-open-neon-limb--right-hb {
      box-shadow:
        0 0 6px rgba(80, 220, 255, 0.5),
        0 0 10px rgba(40, 200, 255, 0.35);
    }
  }

  /* Маркер: свечение; пульсация только с классом --pulse */
  .case-open-center-marker {
    opacity: 0.97;
  }
  @keyframes case-open-marker-pulse {
    0%, 100% {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 0.88;
      transform: translateX(-50%) scale(1.06);
    }
  }
  .case-open-center-marker--pulse {
    animation: case-open-marker-pulse 1.15s ease-in-out infinite;
  }
  @media (max-width: 1023px) {
    .case-open-center-marker {
      opacity: 0.92;
    }
    .case-open-center-marker--pulse {
      /* На мобильных оставляем лёгкую transform-пульсацию (без тяжелых фильтров) */
      animation: case-open-marker-pulse 1.35s ease-in-out infinite;
      opacity: 0.95;
    }
  }
  .case-open-marker-needle {
    width: 2px;
    height: 12px;
    border-radius: 1px;
    background: linear-gradient(180deg, transparent, rgba(253, 230, 138, 0.95));
    margin-bottom: -1px;
  }
  @media (min-width: 1024px) {
    .case-open-marker-needle {
      height: 17px;
    }
  }

  /* Полоска предметов при открытии кейса — снижает лаги на iPhone */
  .case-open-strip {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    contain: layout style;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    /* Центр первого слота: 50% − половина ширины карточки (120px, ~+20% к 100px) */
    padding-left: calc(50% - 60px);
    padding-right: calc(50% - 60px);
  }
  @media (min-width: 640px) {
    .case-open-strip {
      padding-left: calc(50% - 67px);
      padding-right: calc(50% - 67px);
    }
  }

  /* Десктоп: карточки 154px — центр первого слота */
  .case-open-strip.case-open-strip--desktop {
    padding-left: calc(50% - 77px);
    padding-right: calc(50% - 77px);
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
