import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../../../utils/imageUtils';

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
      console.log('🎯 AchievementsModal OPENED');
      console.log('📊 Modal achievements data:', {
        count: achievements.length,
        loading: loading,
        achievements: achievements
      });
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, achievements, loading]);

  if (!isOpen) return null;

  const completedCount = achievements.filter(a => a.is_completed).length;
  const totalPoints = achievements.reduce((sum, a) => sum + (a.is_completed ? a.xp_reward : 0), 0);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999998] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-7xl max-h-[90vh] bg-[#0a0a0a] rounded-lg border border-gray-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Stats */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-gray-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-wider text-gray-400 uppercase">
              <span className="text-white">ПОЛУЧЕНО:</span>{' '}
              <span className="text-yellow-500 text-2xl font-bold mx-2">{completedCount}</span>
              <span className="text-white">из {achievements.length}</span>{' '}
              <span className="text-white">ДОСТИЖЕНИЙ</span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-8 py-6 custom-scrollbar">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-48 bg-gray-900/30 rounded border border-gray-800 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {achievements.map((achievement) => {
                const progress = achievement.current_progress || 0;
                const required = achievement.requirement_value;
                const progressPercent = Math.min((progress / required) * 100, 100);
                const isCompleted = achievement.is_completed || progressPercent >= 100;
                const isLegendary = achievement.category === 'legendary';
                const isExpert = achievement.category === 'expert';

                // Определяем количество кружков прогресса
                const progressCircles = Math.min(5, Math.ceil(required / 10)) || 3;
                const completedCircles = isCompleted ? progressCircles : Math.floor((progress / required) * progressCircles);

                return (
                  <div
                    key={achievement.id}
                    className={`relative bg-gradient-to-b from-gray-900/80 to-black/80 border rounded overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                      isCompleted
                        ? 'border-gray-700'
                        : 'border-gray-800/50'
                    } ${
                      isLegendary && isCompleted
                        ? 'shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                        : isExpert && isCompleted
                        ? 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : ''
                    }`}
                  >
                    {/* Огненный эффект для легендарных */}
                    {isLegendary && isCompleted && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-amber-600/5 to-transparent animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-amber-600/10"></div>
                      </>
                    )}

                    {/* Фиолетовое свечение для экспертных */}
                    {isExpert && isCompleted && (
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-purple-600/5 to-transparent"></div>
                    )}

                    <div className="relative z-10 p-4">
                      {/* Progress circles */}
                      <div className="flex gap-1.5 mb-3">
                        {Array.from({ length: progressCircles }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              i < completedCircles
                                ? isCompleted
                                  ? 'border-green-500 bg-green-500/30'
                                  : 'border-blue-500 bg-blue-500/30'
                                : 'border-gray-700 bg-gray-900/50'
                            }`}
                          >
                            {i < completedCircles && (
                              <div className={`w-2 h-2 rounded-full ${
                                isCompleted ? 'bg-green-400' : 'bg-blue-400'
                              }`}></div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Icon and Title */}
                      <div className="flex gap-3 mb-3">
                        <div
                          className="w-16 h-16 bg-black/50 rounded border border-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden relative cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
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
                              src={(() => {
                                const url = getImageUrl(achievement.icon_url);
                                console.log('🖼️ Achievement Image:', {
                                  name: achievement.name,
                                  originalPath: achievement.icon_url,
                                  generatedURL: url
                                });
                                return url;
                              })()}
                              alt={achievement.name}
                              className="w-full h-full object-contain p-1"
                              onLoad={(e) => {
                                console.log('✅ Image loaded successfully:', achievement.name, e.currentTarget.src);
                              }}
                              onError={(e) => {
                                console.error('❌ Image failed to load:', {
                                  name: achievement.name,
                                  src: e.currentTarget.src,
                                  originalPath: achievement.icon_url
                                });
                                // Fallback to emoji if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">🏆</span>';
                              }}
                            />
                          ) : (
                            <span className="text-3xl">🏆</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h4 className={`font-bold text-sm mb-1 leading-tight uppercase tracking-wide ${
                            isLegendary && isCompleted
                              ? 'text-yellow-500'
                              : isExpert && isCompleted
                              ? 'text-purple-400'
                              : isCompleted
                              ? 'text-blue-400'
                              : 'text-gray-400'
                          }`}>
                            {achievement.name}
                          </h4>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-3">
                        {achievement.description}
                      </p>

                      {/* Progress display */}
                      <div className="mb-3">
                        <div className={`text-4xl font-bold ${
                          isCompleted ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : progress}
                        </div>
                        {!isCompleted && (
                          <div className="text-xs text-gray-600 mt-1">{progress}/{required}</div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-gray-800 space-y-2">
                        {/* Бонус к шансу */}
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12a3 3 0 01-2.5-1.5 3 3 0 01-2.5 1.5h-.12v-2.14a3 3 0 002.5-1.5 3 3 0 002.5 1.5v2.14h-.12z" />
                          </svg>
                          <span className="text-xs font-semibold">
                            +{achievement.bonus_percentage || 0.5}% к шансу дропа
                          </span>
                        </div>

                        {/* Уровень достижения */}
                        <div className="flex items-center">
                          <div className={`text-xs font-bold uppercase tracking-wider ${
                            isLegendary ? 'text-yellow-500' :
                            isExpert ? 'text-purple-400' :
                            achievement.category === 'beginner' ? 'text-green-400' :
                            'text-blue-400'
                          }`}>
                            {achievement.category === 'beginner' ? t('achievements.category.beginner', 'Обычное') :
                             achievement.category === 'regular' ? t('achievements.category.regular', 'Необычное') :
                             achievement.category === 'expert' ? t('achievements.category.expert', 'Редкое') :
                             achievement.category === 'legendary' ? t('achievements.category.legendary', 'Легендарное') :
                             achievement.category}
                          </div>
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
            className="fixed pointer-events-none z-[200] transition-opacity duration-200"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`,
              opacity: hoveredIcon ? 1 : 0
            }}
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-500 rounded-lg shadow-2xl shadow-blue-500/50 p-3 animate-in fade-in zoom-in-95 duration-200">
              <img
                src={getImageUrl(achievements.find(a => a.id === hoveredIcon)?.icon_url || '')}
                alt="Preview"
                className="w-48 h-48 object-contain"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
                }}
              />
              <div className="mt-2 text-center">
                <p className="text-white font-bold text-sm">
                  {achievements.find(a => a.id === hoveredIcon)?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Рендерим модальное окно в body через портал
  return createPortal(modalContent, document.body);
};

export default AchievementsModal;
