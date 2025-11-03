import toast from 'react-hot-toast';
import { soundManager } from './soundManager';

// Обертка для toast с звуками
export const toastWithSound = {
  success: (message: string, options?: any) => {
    soundManager.play('notification');
    return toast.success(message, options);
  },

  error: (message: string, options?: any) => {
    soundManager.play('notification');
    return toast.error(message, options);
  },

  // Toast для предупреждений
  warning: (message: string, options?: any) => {
    soundManager.play('notification');
    return toast(message, {
      icon: '⚠️',
      ...options
    });
  },

  // Toast для информационных сообщений
  info: (message: string, options?: any) => {
    soundManager.play('notification');
    return toast(message, {
      icon: 'ℹ️',
      ...options
    });
  },

  // Обычный toast без специального типа
  default: (message: string, options?: any) => {
    soundManager.play('notification');
    return toast(message, options);
  },

  // Promise toast
  promise: toast.promise,

  // Loading toast
  loading: toast.loading,

  // Dismiss toast
  dismiss: toast.dismiss,

  // Custom toast
  custom: toast.custom,
};

// Экспортируем также оригинальный toast на случай если нужен без звука
export { toast };
