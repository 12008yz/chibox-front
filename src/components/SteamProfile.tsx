import React from 'react';
import Avatar from './Avatar';
import type { User } from '../types/api';

interface SteamProfileProps {
  user: User;
}

const SteamProfile: React.FC<SteamProfileProps> = ({ user }) => {
  if (!user.steam_id) {
    return (
      <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-gray-400"
          >
            <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
          </svg>
          Steam аккаунт
        </h3>
        <p className="text-gray-400 mb-4">Steam аккаунт не привязан</p>
        <button className="bg-[#171a21] hover:bg-[#2a2d35] text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white"
          >
            <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
          </svg>
          Привязать Steam аккаунт
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-green-400"
        >
          <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
        </svg>
        Steam аккаунт
        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
          Привязан
        </span>
      </h3>

      <div className="flex items-start gap-4">
        {/* Steam аватар */}
        <div className="flex-shrink-0">
          <Avatar
            steamAvatar={user.steam_avatar_url}
            id={user.steam_id}
            size="large"
            level={user.level}
            showLevel={true}
          />
        </div>

        {/* Информация о Steam профиле */}
        <div className="flex-1 space-y-2">
          <div>
            <span className="text-gray-400 text-sm">Steam никнейм:</span>
            <p className="text-white font-medium">{user.steam_profile?.personaname || 'Не указан'}</p>
          </div>

          <div>
            <span className="text-gray-400 text-sm">Steam ID:</span>
            <p className="text-white font-mono text-sm">{user.steam_id}</p>
          </div>

          {user.steam_profile_url && (
            <div>
              <span className="text-gray-400 text-sm">Профиль:</span>
              <p>
                <a
                  href={user.steam_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                >
                  Открыть в Steam
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/>
                  </svg>
                </a>
              </p>
            </div>
          )}

          {user.steam_trade_url && (
            <div>
              <span className="text-gray-400 text-sm">Trade URL:</span>
              <p className="text-green-400 text-sm">Настроен</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SteamProfile;
