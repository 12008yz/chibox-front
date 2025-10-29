import React from 'react';
import { useTranslation } from 'react-i18next';

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

  if (!isOpen) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'from-green-500/20 to-green-700/20 border-green-500/30';
      case 'regular': return 'from-blue-500/20 to-blue-700/20 border-blue-500/30';
      case 'expert': return 'from-purple-500/20 to-purple-700/20 border-purple-500/30';
      case 'legendary': return 'from-red-500/20 to-red-700/20 border-red-500/30';
      default: return 'from-gray-500/20 to-gray-700/20 border-gray-500/30';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'beginner': return t('achievements.category.beginner', 'Начинающий');
      case 'regular': return t('achievements.category.regular', 'Обычный');
      case 'expert': return t('achievements.category.expert', 'Эксперт');
      case 'legendary': return t('achievements.category.legendary', 'Легендарный');
      default: return category;
    }
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryOrder: Array<'beginner' | 'regular' | 'expert' | 'legendary'> = ['beginner', 'regular', 'expert', 'legendary'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('achievements.modal.title', 'Достижения')}</h2>
                <p className="text-sm text-gray-400">
                  {t('achievements.modal.completed', 'Выполнено')}: {achievements.filter(a => a.is_completed).length} / {achievements.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-600/30 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-32 bg-gray-600/30 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {categoryOrder.map((category) => {
                const categoryAchievements = groupedAchievements[category];
                if (!categoryAchievements || categoryAchievements.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)}`}></span>
                      {getCategoryTitle(category)}
                      <span className="text-sm text-gray-400 font-normal">
                        ({categoryAchievements.filter(a => a.is_completed).length}/{categoryAchievements.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryAchievements.map((achievement) => {
                        const progress = achievement.current_progress || 0;
                        const required = achievement.requirement_value;
                        const progressPercent = Math.min((progress / required) * 100, 100);
                        const isCompleted = achievement.is_completed || progressPercent >= 100;

                        return (
                          <div
                            key={achievement.id}
                            className={`relative bg-gradient-to-br ${getCategoryColor(achievement.category)} border rounded-xl p-4 transition-all duration-300 ${
                              isCompleted
                                ? 'shadow-lg hover:shadow-xl'
                                : 'opacity-70 hover:opacity-90'
                            }`}
                          >
                            {isCompleted && (
                              <div className="absolute top-2 right-2">
                                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}

                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                style={{ backgroundColor: achievement.badge_color + '30' }}
                              >
                                🏆
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-bold text-sm mb-1">{achievement.name}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2">{achievement.description}</p>
                              </div>
                            </div>

                            {!isCompleted && (
                              <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span>{t('achievements.progress', 'Прогресс')}</span>
                                  <span>{progress} / {required}</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between text-xs">
                              <span className="text-purple-400">+{achievement.xp_reward} XP</span>
                              {isCompleted && (
                                <span className="text-green-400 font-semibold">{t('achievements.completed', 'Выполнено')}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
