// Утилиты для работы с авторизацией
import { AppDispatch } from '../store';
import { logout } from '../features/auth/authSlice';
import { baseApi } from '../store/api/baseApi';

/**
 * Полная очистка состояния приложения при выходе
 * Очищает localStorage, Redux store и кэш API
 */
export const performFullLogout = (dispatch: AppDispatch) => {
  try {
    // Сбрасываем весь кэш RTK Query ПЕРЕД очисткой Redux
    dispatch(baseApi.util.resetApiState());

    // Очищаем Redux состояние и localStorage
    dispatch(logout());

    // Дополнительная очистка localStorage (на случай если есть другие ключи)
    const keysToKeep = [
      'theme', // сохраняем тему
      'language', // сохраняем язык
      'cookieConsent' // сохраняем согласие на куки
    ];

    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Очищаем sessionStorage полностью
    sessionStorage.clear();

    console.log('Full logout completed - all user data cleared');

  } catch (error) {
    console.error('Error during full logout:', error);
    // В случае ошибки все равно выполняем базовый logout
    dispatch(logout());
  }
};

/**
 * Проверка и очистка устаревших данных в localStorage
 */
export const cleanupExpiredData = () => {
  try {
    // Проверяем и удаляем устаревшие токены или данные
    const expiryKeys = Object.keys(localStorage).filter(key =>
      key.includes('_expiry') || key.includes('_timestamp')
    );

    expiryKeys.forEach(key => {
      const timestamp = localStorage.getItem(key);
      if (timestamp && Date.now() > parseInt(timestamp)) {
        // Удаляем устаревшие данные
        const dataKey = key.replace('_expiry', '').replace('_timestamp', '');
        localStorage.removeItem(dataKey);
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired data:', error);
  }
};

/**
 * Сохранение данных пользователя для быстрого доступа
 */
export const cacheUserData = (user: any, remember = false) => {
  try {
    if (remember) {
      localStorage.setItem('last_username', user.username || '');
      localStorage.setItem('user_preferences', JSON.stringify({
        theme: user.theme,
        language: user.language,
        notifications: user.notificationSettings
      }));
    }
  } catch (error) {
    console.error('Error caching user data:', error);
  }
};
