import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievements } from '../../hooks/useAchievements';
import { getDaysDeclensionKey } from '../../../../utils/declension';

interface AchievementsCardProps {
  completedAchievementsCount: number;
  totalAchievements: number;
  achievementsProgress: any[];
  achievementsLoading: boolean;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({
  completedAchievementsCount,
  totalAchievements,
  achievementsProgress,
  achievementsLoading
}) => {
  const { t } = useTranslation();
  const {
    isAchievementsExpanded,
    achievementsRef,
    translateAchievement,
    toggleAchievements
  } = useAchievements();

  return (
    <div
      ref={achievementsRef}
      data-achievements-section
      className={`relative bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl border transition-all duration-300 overflow-visible ${
        isAchievementsExpanded
          ? 'border-red-500/50 shadow-lg shadow-red-500/20'
          : 'border-gray-700/30 hover:border-red-500/30'
      }`}
    >
      {/* Main Achievement Card */}
      <div className="p-6 cursor-pointer" onClick={toggleAchievements}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isAchievementsExpanded
              ? 'bg-red-500/30 scale-110 shadow-lg shadow-red-500/20'
              : 'hover:bg-red-500/25 hover:scale-105'
          }`}>
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm">{t('profile.achievements')}</p>
            <p className="text-xl font-bold text-white">
              {completedAchievementsCount}
              <span className="text-gray-400 text-sm">/{totalAchievements}</span>
            </p>
          </div>
          <div className={`text-red-400 transition-transform duration-300 ${
            isAchievementsExpanded ? 'rotate-180' : 'hover:translate-y-1'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Progress Preview */}
        <div className="mt-3">
          <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 transition-all duration-500 rounded-full ${
                isAchievementsExpanded ? 'shadow-sm shadow-red-500/50' : ''
              }`}
              style={{ width: `${Math.round((completedAchievementsCount / totalAchievements) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-end text-xs text-gray-400 mt-1">
            <span>{isAchievementsExpanded ? t('profile.achievements_collapse_hint') : t('profile.achievements_expand_hint')}</span>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`absolute top-full left-0 right-0 bg-gradient-to-br from-[#1a1530] to-[#2a1f47] border-t border-gray-700/30 rounded-b-xl overflow-hidden transition-all duration-700 ease-in-out shadow-2xl z-[50] ${
        isAchievementsExpanded
          ? 'max-h-[600px] opacity-100 transform scale-y-100'
          : 'max-h-0 opacity-0 transform scale-y-95 pointer-events-none'
      }`}>
        <div className={`transition-all duration-600 ease-in-out ${
          isAchievementsExpanded
            ? 'opacity-100 delay-200 transform translate-y-0'
            : 'opacity-0 transform -translate-y-2'
        }`}>
          {achievementsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-600/30 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600/30 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-600/30 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : achievementsProgress.length > 0 ? (
            <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {achievementsProgress.map((achievement, index) => {
                  // Проверяем, что achievement существует
                  if (!achievement) {
                    return null;
                  }

                  const isCompleted = achievement.completed;
                  const progress = achievement.progress || 0;
                  const target = achievement.target || 1;
                  const progressPercentage = Math.min(100, Math.round((progress / target) * 100));

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] transform ${
                        isCompleted
                          ? 'bg-green-500/10 border-green-500/30 shadow-sm shadow-green-500/20'
                          : 'bg-gray-700/20 border-gray-600/30 hover:border-gray-500/50'
                      } ${
                        isAchievementsExpanded
                          ? 'translate-y-0 opacity-100 scale-100'
                          : 'translate-y-4 opacity-0 scale-95'
                      }`}
                      style={{
                        transitionDelay: isAchievementsExpanded ? `${index * 50}ms` : `${(achievementsProgress.length - index) * 30}ms`,
                        transitionDuration: '400ms'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Achievement Icon */}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-green-600'
                              : 'bg-gray-600/30'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 011.414 0L9 10.586 7.707 9.293a1 1 0 011.414 1.414l2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Achievement Info */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h5 className="font-medium text-white text-sm leading-tight">
                                {achievement.name ? translateAchievement(achievement.name, 'name') : t('profile.unknown_achievement')}
                              </h5>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-blue-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12a3 3 0 01-2.5-1.5c-.345-.23-.614-.558-.822.88-.214-.33-.403-.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 01-.613-3.58 2.64 2.64 0 01-.945 1.067c-.328.68-.398 1.534-.398 2.654A1 1 0 015.05 6.05 6.981 6.981 0 013 11a7 7 0 1111.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd" />
                              </svg>
                              <span>+{achievement.bonus_percentage || '0.5'}{t('profile.drop_bonus_text')}</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {achievement.description ? translateAchievement(achievement.description, 'description') : t('profile.no_description')}
                          </p>

                          {/* Progress */}
                          {!isCompleted && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>
                                  {progress}/{target}
                                  {achievement.requirement_type === 'subscription_days' ? ` ${t(getDaysDeclensionKey(target))}` :
                                   achievement.requirement_type === 'cases_opened' ? t('profile.cases_suffix') :
                                   achievement.requirement_type === 'daily_streak' ? ` ${t(getDaysDeclensionKey(target))}${t('profile.streak_suffix')}` :
                                   achievement.requirement_type === 'best_item_value' ? t('profile.currency_suffix') :
                                   achievement.requirement_type === 'total_items_value' ? t('profile.currency_suffix') :
                                   achievement.requirement_type === 'rare_items_found' ? t('profile.items_suffix') :
                                   achievement.requirement_type === 'premium_items_found' ? t('profile.items_suffix') : ''}
                                </span>
                                <span>{progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">{t('profile.achievements_not_loaded')}</p>
              <p className="text-gray-500 text-xs">
                {t('common.loading')}: {achievementsLoading ? t('profile.loading_yes') : t('profile.loading_no')} |
                {t('profile.achievements_count')}: {achievementsProgress.length} |
                {t('profile.total_count')}: {totalAchievements}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsCard;
