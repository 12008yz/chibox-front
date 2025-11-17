import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../../../utils/imageUtils';
import { soundManager } from '../../../../utils/soundManager';

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp_reward: number;
  icon_url: string;
  requirement_type: string;
  requirement_value: number;
  category: 'beginner' | 'regular' | 'expert' | 'legendary';
  badge_color: string;
  is_completed?: boolean;
  current_progress?: number;
  bonus_percentage?: number;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  loading?: boolean;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  loading = false
}) => {
  const { t } = useTranslation();
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Блокировка скролла при открытии модального окна
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      soundManager.play('modal');
    } else {
      document.body.style.overflow = 'unset';
      if (document.body.style.overflow === 'unset') {
        soundManager.play('modal');
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, achievements, loading]);

  if (!isOpen) return null;

  const completedCount = achievements.filter(a => a.is_completed).length;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'beginner': return t('achievements.category.beginner', 'Обычное');
      case 'regular': return t('achievements.category.regular', 'Необычное');
      case 'expert': return t('achievements.category.expert', 'Редкое');
      case 'legendary': return t('achievements.category.legendary', 'Легендарное');
      default: return category;
    }
  };

  const getCategoryColor = (category: string, isCompleted: boolean) => {
    if (!isCompleted) return 'text-gray-600';
    switch (category) {
      case 'legendary': return 'text-amber-500';
      case 'expert': return 'text-purple-400';
      case 'regular': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999998] flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] bg-[#0f0f0f] border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-white mb-1">Достижения</h2>
              <p className="text-sm text-gray-400">
                Получено: <span className="text-white font-medium">{completedCount}</span> из {achievements.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-[#1a1a1a] border border-gray-800"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const progress = achievement.current_progress || 0;
                const required = achievement.requirement_value;
                const progressPercent = Math.min((progress / required) * 100, 100);
                const isCompleted = achievement.is_completed || progressPercent >= 100;

                return (
                  <div
                    key={achievement.id}
                    className={`bg-[#1a1a1a] border transition-colors ${
                      isCompleted
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="p-5">
                      {/* Icon and Category */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-14 h-14 bg-black border border-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:border-gray-600 transition-colors"
                          onMouseEnter={(e) => {
                            if (achievement.icon_url) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoverPosition({ x: rect.right + 10, y: rect.top });
                              setHoveredIcon(achievement.id);
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredIcon(null);
                          }}
                        >
                          {achievement.icon_url ? (
                            <img
                              src={getImageUrl(achievement.icon_url)}
                              alt={achievement.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🏆</span>';
                              }}
                            />
                          ) : (
                            <span className="text-2xl">🏆</span>
                          )}
                        </div>
                        <div className={`text-xs font-medium uppercase tracking-wider ${getCategoryColor(achievement.category, isCompleted)}`}>
                          {getCategoryLabel(achievement.category)}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className={`font-medium text-sm mb-2 leading-tight ${
                        isCompleted ? 'text-white' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-gray-500 mb-4 leading-relaxed min-h-[40px]">
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Прогресс</span>
                          <span>{isCompleted ? 'Получено' : `${progress}/${required}`}</span>
                        </div>
                        <div className="h-1 bg-gray-800 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Bonus */}
                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Бонус к дропу</span>
                          <span className="text-xs font-medium text-blue-400">
                            +{achievement.bonus_percentage || 0.5}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image Preview on Hover */}
        {hoveredIcon && achievements.find(a => a.id === hoveredIcon)?.icon_url && (
          <div
            className="fixed pointer-events-none z-[200]"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`,
            }}
          >
            <div className="bg-black border border-gray-700 p-4">
              <img
                src={getImageUrl(achievements.find(a => a.id === hoveredIcon)?.icon_url || '')}
                alt="Preview"
                className="w-48 h-48 object-contain"
              />
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-white font-medium text-sm">
                  {achievements.find(a => a.id === hoveredIcon)?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AchievementsModal;
