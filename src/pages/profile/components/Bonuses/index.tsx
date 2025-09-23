import React from 'react';
import { useTranslation } from 'react-i18next';

interface DropRateBonusesProps {
  user: any;
}

const DropRateBonuses: React.FC<DropRateBonusesProps> = ({ user }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
      <h4 className="text-lg font-semibold mb-3">{t('profile.drop_bonuses')}</h4>
      <div className="space-y-2">
        {(user.level_bonus_percentage ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">{t('profile.level_bonus')}</span>
            <span className="text-green-400 text-sm">+{parseFloat(Number(user.level_bonus_percentage).toFixed(2))}%</span>
          </div>
        )}
        {(user.subscription_bonus_percentage ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">{t('profile.status_bonus')}</span>
            <span className="text-blue-400 text-sm">+{parseFloat(Number(user.subscription_bonus_percentage).toFixed(1))}%</span>
          </div>
        )}
        {(user.achievements_bonus_percentage ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">{t('profile.achievements_bonus')}</span>
            <span className="text-purple-400 text-sm">+{parseFloat(Number(user.achievements_bonus_percentage).toFixed(1))}%</span>
          </div>
        )}
        {(user.total_drop_bonus_percentage ?? 0) > 0 && (
          <div className="border-t border-gray-600/30 pt-2 mt-3">
            <div className="flex justify-between">
              <span className="text-white font-semibold text-sm">{t('profile.total_bonus')}</span>
              <span className="text-yellow-400 font-semibold text-sm">
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
