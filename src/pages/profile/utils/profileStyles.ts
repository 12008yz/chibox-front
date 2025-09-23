// Добавляем стили для плавной анимации
export const profileStyles = `
  @keyframes slideDown {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 600px;
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      max-height: 600px;
      opacity: 1;
    }
    to {
      max-height: 0;
      opacity: 0;
    }
  }

  .achievements-expand-enter {
    animation: slideDown 0.5s ease-in-out forwards;
  }

  .achievements-expand-exit {
    animation: slideUp 0.3s ease-in-out forwards;
  }

  /* Notification animations */
  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(100%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .notification-success {
    box-shadow: 0 10px 40px rgba(34, 197, 94, 0.3);
  }

  .notification-error {
    box-shadow: 0 10px 40px rgba(239, 68, 68, 0.3);
  }

  .notification-info {
    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
  }
`;

// Функция для добавления стилей в head
export const injectProfileStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('profile-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'profile-styles';
    styleSheet.textContent = profileStyles;
    document.head.appendChild(styleSheet);
  }
};
