import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDaysI18n } from '../../../../utils/declension';
import { getSubscriptionName } from '../../utils/profileUtils';
import AchievementsCard from '../Achievements/AchievementsCard';

interface ProfileStatsProps {
  user: any;
  availableInventoryCount: number;
  openedCasesCount: number;
  achievementsProgressData: any;
  allAchievementsData: any;
  achievementsLoading: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  user,
  availableInventoryCount,
  openedCasesCount,
  achievementsProgressData,
  allAchievementsData,
  achievementsLoading
}) => {
  const { t } = useTranslation();

  // Всегда используем данные из API запроса прогресса достижений
  const achievementsProgress = achievementsProgressData?.success ? achievementsProgressData.data : [];

  // Общее количество достижений в системе (соответствует сидеру)
  const totalAchievements = allAchievementsData?.success ? allAchievementsData.data.length : 23;

  // Завершенные достижения
  const completedAchievementsCount = achievementsProgress.filter((ach: any) => ach.completed).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {/* Cases Opened */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 lg:p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10h14v7a1 1 0 01-1 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1a1 1 0 011-1v-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm truncate">{t('profile.cases_opened')}</p>
            <p className="text-lg sm:text-xl font-bold text-white">
              {openedCasesCount}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Count */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 lg:p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm truncate">{t('profile.items_in_inventory')}</p>
            <p className="text-lg sm:text-xl font-bold text-white">{availableInventoryCount}</p>
          </div>
        </div>
      </div>

      {/* Achievements - Interactive */}
      <AchievementsCard
        completedAchievementsCount={completedAchievementsCount}
        totalAchievements={totalAchievements}
        achievementsProgress={achievementsProgress}
        achievementsLoading={achievementsLoading}
      />

      {/* Subscription */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 lg:p-6 border border-white/10 hover:border-yellow-500/50 transition-all duration-300 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">
              {user.subscription_tier && (user.subscription_days_left ?? 0) > 0 ? (
                <>
                  {getSubscriptionName(user.subscription_tier, t)}
                  <span className="text-gray-400 text-xs sm:text-sm block truncate">
                    {formatDaysI18n(user.subscription_days_left || 0, t)}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 text-sm sm:text-base">{t('profile.no_subscription')}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
