import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const useAchievements = () => {
  const { t } = useTranslation();
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);
  const achievementsRef = useRef<HTMLDivElement>(null);

  // Функция для перевода достижений
  const translateAchievement = (achievementName: string, field: 'name' | 'description') => {
    // Убеждаемся, что achievementName существует
    if (!achievementName) {
      console.log('Achievement name is empty or undefined');
      return field === 'name' ? t('profile.unknown_achievement') : t('profile.no_description');
    }

    const key = `achievements.${achievementName}.${field}`;
    const translation = t(key);

    console.log('Translation attempt:', {
      achievementName,
      field,
      key,
      translation,
      isKeyEqualToTranslation: translation === key,
      currentLanguage: t('language.title')
    });

    // Если перевод не найден, пробуем найти по базовому названию
    if (translation === key) {
      console.warn(`Translation not found for key: ${key}`);

      // Возвращаем оригинальное значение с fallback
      return field === 'name' ? achievementName : t('profile.no_description');
    }

    return translation;
  };

  // Функция для переключения состояния секции достижений
  const toggleAchievements = () => {
    console.log('toggleAchievements clicked, current state:', isAchievementsExpanded);
    // Если секция разворачивается, автоматически скроллим к ней
    if (!isAchievementsExpanded) {
      setTimeout(() => {
        const achievementsElement = document.querySelector('[data-achievements-section]');
        if (achievementsElement) {
          achievementsElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } else {
      // При сворачивании через кнопку скроллим вверх к началу страницы
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setIsAchievementsExpanded(!isAchievementsExpanded);
  };

  // Функция для закрытия достижений без скролла (при клике вне области)
  const closeAchievementsWithoutScroll = () => {
    setIsAchievementsExpanded(false);
  };

  // Отслеживаем изменения состояния достижений
  useEffect(() => {
    console.log('isAchievementsExpanded changed to:', isAchievementsExpanded);
  }, [isAchievementsExpanded]);

  // Обработчик клика вне области достижений
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAchievementsExpanded &&
          achievementsRef.current &&
          !achievementsRef.current.contains(event.target as Node)) {
        closeAchievementsWithoutScroll();
      }
    };

    if (isAchievementsExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAchievementsExpanded]);

  return {
    isAchievementsExpanded,
    achievementsRef,
    translateAchievement,
    toggleAchievements,
    closeAchievementsWithoutScroll
  };
};
