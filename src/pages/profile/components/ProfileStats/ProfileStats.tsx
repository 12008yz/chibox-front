import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDaysI18n } from '../../../../utils/declension';
import { getSubscriptionName } from '../../utils/profileUtils';
import AchievementsCard from '../Achievements/AchievementsCard';

interface ProfileStatsProps {
  user: any;
  availableInventoryCount: number;
  achievementsProgressData: any;
  allAchievementsData: any;
  achievementsLoading: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  user,
  availableInventoryCount,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Cases Opened */}
      <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10h14v7a1 1 0 01-1 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1a1 1 0 011-1v-7z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">{t('profile.cases_opened')}</p>
            <p className="text-xl font-bold text-white">
              {user.total_cases_opened || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Count */}
      <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">{t('profile.items_in_inventory')}</p>
            <p className="text-xl font-bold text-white">{availableInventoryCount}</p>
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
      <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-yellow-500/50 transition-all duration-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {user.subscription_tier ? (
                <>
                  {getSubscriptionName(user.subscription_tier, t)}
                  <span className="text-gray-400 text-sm block">
                    {formatDaysI18n(user.subscription_days_left || 0, t)}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 text-base">{t('profile.no_subscription')}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
