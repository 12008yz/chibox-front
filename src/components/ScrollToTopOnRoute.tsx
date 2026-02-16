import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Компонент для автоматического скролла вверх и отправки просмотра страницы в аналитику при смене роута
 */
const ScrollToTopOnRoute = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Используем instant для мгновенного перехода
    });
  }, [pathname]);

  // Отправляем просмотр страницы в Яндекс.Метрику / Google Analytics (если подключены)
  useEffect(() => {
    trackPageView(pathname, document.title);
  }, [pathname]);

  return null;
};

export default ScrollToTopOnRoute;
