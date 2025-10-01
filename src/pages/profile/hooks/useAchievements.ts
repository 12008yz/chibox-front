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
      return field === 'name' ? t('profile.unknown_achievement') : t('profile.no_description');
    }

    const key = `achievements.${achievementName}.${field}`;
    const translation = t(key);


    // Если перевод не найден, пробуем найти по базовому названию
    if (translation === key) {

      // Возвращаем оригинальное значение с fallback
      return field === 'name' ? achievementName : t('profile.no_description');
    }

    return translation;
  };

  // Функция для переключения состояния секции достижений
  const toggleAchievements = () => {
    setIsAchievementsExpanded(!isAchievementsExpanded);
  };

  // Функция для закрытия достижений без скролла (при клике вне области)
  const closeAchievementsWithoutScroll = () => {
    setIsAchievementsExpanded(false);
  };

  // Отслеживаем изменения состояния достижений
  useEffect(() => {
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
