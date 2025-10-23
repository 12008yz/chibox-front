import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../../components/Avatar';
import Tooltip from '../../../../components/Tooltip';
import { calculateLevelProgress } from '../../utils/profileUtils';
import Monetary from '../../../../components/Monetary';

interface ProfileHeaderProps {
  user: any;
  onSettingsClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onSettingsClick }) => {
  const { t } = useTranslation();
  const { xpInCurrentLevel, xpToNextLevel, progressPercentage } = calculateLevelProgress(user);

  return (
    <div className="relative bg-gradient-to-r from-[#1a1530] via-[#2a1f47] to-[#1a1530] rounded-2xl p-8 border border-gray-700/30 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-green-500 to-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors border border-gray-600/50 hover:border-gray-500"
          title={t('profile.profile_settings_title')}
        >
          <svg className="w-5 h-5 text-gray-300 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.807-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-1 flex items-center justify-center">
              <Avatar
                steamAvatar={user.steam_avatar_url || user.steam_avatar || user.steam_profile?.avatarfull}
                id={user.id}
                size="large"
                level={user.level}
                showLevel={false}
              />
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm px-3 py-1 rounded-full shadow-lg">
              LVL {user.level}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {user.username || user.steam_profile?.personaname}
            </h1>
            <p className="text-gray-400 text-sm">ID: {user.id}</p>

            {/* Steam Status */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
              </svg>
              <span className={`text-sm px-2 py-1 rounded-full ${
                user.steam_id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {user.steam_id ? t('profile.steam_connected') : t('profile.steam_not_connected')}
              </span>
            </div>
          </div>
        </div>

        {/* Balance and Level Progress */}
        <div className="flex-1 space-y-4">
          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{t('common.balance')}</span>
              <span className="text-2xl font-bold text-green-400">
                <Monetary value={Number(user.balance)} showFraction={true} />
              </span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{t('profile.level_progress')}</span>
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <div className="font-semibold text-white mb-2">{t('profile.xp_earned_for')}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>{t('profile.opening_cases')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span>{t('profile.level_bonus_tooltip.completing_achievements')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{t('profile.level_bonus_tooltip.daily_login')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>{t('profile.level_bonus_tooltip.shop_purchases')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>{t('profile.level_bonus_tooltip.event_participation')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span>{t('profile.level_bonus_tooltip.friend_invites')}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                        {t('profile.level_bonus_tooltip.level_drop_bonus')}
                      </div>
                    </div>
                  }
                  position="bottom"
                >
                  <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center cursor-help hover:bg-gray-500 transition-colors">
                    <span className="text-xs text-white font-bold">?</span>
                  </div>
                </Tooltip>
              </div>
              <span className="text-sm text-gray-300">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{xpInCurrentLevel.toLocaleString()}/{xpToNextLevel.toLocaleString()} XP</span>
              <span>{t('profile.level_text')} {user.level}/{t('profile.level_max')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
