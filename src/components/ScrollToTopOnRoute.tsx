import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Компонент для автоматического скролла вверх при смене роута
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

  return null;
};

export default ScrollToTopOnRoute;
