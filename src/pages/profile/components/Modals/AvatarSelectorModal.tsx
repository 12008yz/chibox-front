import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/Modal';
import { useGetAvatarsQuery, useUpdateAvatarMutation } from '../../../../features/user/userApi';
import { toastWithSound } from '../../../../utils/toastWithSound';
import { soundManager } from '../../../../utils/soundManager';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const { data: avatarsData, isLoading } = useGetAvatarsQuery();
  const [updateAvatar, { isLoading: isUpdating }] = useUpdateAvatarMutation();

  const handleSelectAvatar = async () => {
    if (!selectedAvatar) {
      toastWithSound.error(t('profile.select_avatar_first') || 'Выберите аватар');
      return;
    }

    try {
      await updateAvatar({ avatar_url: selectedAvatar }).unwrap();
      soundManager.play('click');
      toastWithSound.success(t('profile.avatar_updated') || 'Аватар успешно обновлен!');
      onClose();
    } catch (error: any) {
      console.error('Ошибка обновления аватара:', error);
      toastWithSound.error(error?.data?.message || t('profile.avatar_update_error') || 'Не удалось обновить аватар');
    }
  };

  const avatars = avatarsData?.data?.avatars || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile.select_avatar') || 'Выберите аватар'}
      showCloseButton={true}
    >
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : avatars.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {t('profile.no_avatars_available') || 'Нет доступных аватаров'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {avatars.map((avatar) => (
                <button
                  key={avatar.filename}
                  onClick={() => {
                    setSelectedAvatar(avatar.url);
                    soundManager.play('click');
                  }}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden transition-all duration-200
                    border-2 hover:scale-105 focus:outline-none
                    ${selectedAvatar === avatar.url
                      ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                      : 'border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <img
                    src={avatar.fullUrl}
                    alt={avatar.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-avatar.png';
                    }}
                  />
                  {selectedAvatar === avatar.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.cancel') || 'Отмена'}
              </button>
              <button
                onClick={handleSelectAvatar}
                disabled={!selectedAvatar || isUpdating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {t('common.saving') || 'Сохранение...'}
                  </span>
                ) : (
                  t('common.save') || 'Сохранить'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AvatarSelectorModal;
