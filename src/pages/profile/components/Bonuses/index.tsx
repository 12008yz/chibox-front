import React from 'react';
import { useTranslation } from 'react-i18next';

interface DropRateBonusesProps {
  user: any;
}

const DropRateBonuses: React.FC<DropRateBonusesProps> = ({ user }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 lg:p-6 border border-white/10 shadow-lg">
      <h4 className="text-base sm:text-lg font-semibold mb-3">{t('profile.drop_bonuses')}</h4>
      <div className="space-y-2">
        {(user.level_bonus_percentage ?? 0) > 0 && (
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400 text-xs sm:text-sm truncate">{t('profile.level_bonus')}</span>
            <span className="text-green-400 text-xs sm:text-sm font-medium flex-shrink-0">+{parseFloat(Number(user.level_bonus_percentage).toFixed(2))}%</span>
          </div>
        )}
        {(user.subscription_bonus_percentage ?? 0) > 0 && (
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400 text-xs sm:text-sm truncate">{t('profile.status_bonus')}</span>
            <span className="text-blue-400 text-xs sm:text-sm font-medium flex-shrink-0">+{parseFloat(Number(user.subscription_bonus_percentage).toFixed(1))}%</span>
          </div>
        )}
        {(user.achievements_bonus_percentage ?? 0) > 0 && (
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400 text-xs sm:text-sm truncate">{t('profile.achievements_bonus')}</span>
            <span className="text-purple-400 text-xs sm:text-sm font-medium flex-shrink-0">+{parseFloat(Number(user.achievements_bonus_percentage).toFixed(1))}%</span>
          </div>
        )}
        {(user.total_drop_bonus_percentage ?? 0) > 0 && (
          <div className="border-t border-gray-600/30 pt-2 mt-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-white font-semibold text-xs sm:text-sm truncate">{t('profile.total_bonus')}</span>
              <span className="text-yellow-400 font-semibold text-xs sm:text-sm flex-shrink-0">
                +{parseFloat(Number(user.total_drop_bonus_percentage || 0).toFixed(2))}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropRateBonuses;
