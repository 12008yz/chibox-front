import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateUserProfileMutation } from '../../../../features/user/userApi';
import { validateUsername, suggestAlternativeUsername } from '../../../../utils/profanityFilter';
import Tooltip from '../../../../components/Tooltip';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setSoundsEnabled } from '../../../../store/slices/uiSlice';
import { soundManager } from '../../../../utils/soundManager';
import { useLogoutMutation } from '../../../../features/auth/authApi';
import { performFullLogout } from '../../../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserRefresh: () => void;
  onEmailVerificationOpen: (skipToVerify?: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserRefresh,
  onEmailVerificationOpen
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const soundsEnabled = useAppSelector(state => state.ui.soundsEnabled);
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Form states
  const [tradeUrl, setTradeUrl] = useState(() => user?.steam_trade_url || '');
  const [newUsername, setNewUsername] = useState(() => user?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [isFetchingTradeUrl, setIsFetchingTradeUrl] = useState(false);

  // Email states
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(() => user?.email || '');
  const [emailError, setEmailError] = useState('');

  const prevIsOpenRef = useRef(false);

  // Блокировка скролла при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      soundManager.play('modal');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Синхронизируем данные с пользователем ТОЛЬКО при открытии модального окна (переход false -> true)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Окно только что открылось
      setTradeUrl(user?.steam_trade_url || '');
      setNewUsername(user?.username || '');
      setNewEmail(user?.email || '');
      setIsEditingEmail(false);
      setEmailError('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, user]);

  // Обработчик изменения имени пользователя с валидацией
  const handleUsernameChange = (newValue: string) => {
    setNewUsername(newValue);

    if (newValue.trim() === '') {
      setUsernameError('');
      return;
    }

    const validation = validateUsername(newValue);
    if (!validation.isValid) {
      setUsernameError(validation.error || t('profile.settings.invalid_username'));
    } else {
      setUsernameError('');
    }
  };

  // Валидация email
  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Обработчик изменения email с валидацией
   * @param newValue - новое значение email
   */
  const handleEmailChange = (newValue: string): void => {
    setNewEmail(newValue);

    if (newValue.trim() === '') {
      setEmailError('');
      return;
    }

    if (!validateEmail(newValue)) {
      setEmailError(t('profile.settings.invalid_email') || 'Неверный формат email');
    } else {
      setEmailError('');
    }
  };

  // Функция для показа уведомлений
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
      default:
        toast(message);
        break;
    }
  };

  // Функция для сохранения настроек
  const handleSaveSettings = async () => {
    try {
      // Валидация имени пользователя, если оно изменилось
      if (newUsername && newUsername !== user?.username) {
        const usernameValidation = validateUsername(newUsername);
        if (!usernameValidation.isValid) {
          const suggestions = suggestAlternativeUsername(newUsername);
          const suggestionText = suggestions.length > 0
            ? ` Попробуйте: ${suggestions.join(', ')}`
            : '';
          showNotification(`${usernameValidation.error}${suggestionText}`, 'error');
          return;
        }
      }

      // Валидация email, если он изменился
      if (newEmail && newEmail !== user?.email) {
        if (!validateEmail(newEmail)) {
          showNotification(t('profile.settings.invalid_email') || 'Неверный формат email', 'error');
          return;
        }
      }

      // Формируем данные для отправки
      const updateData: any = {};

      if (tradeUrl !== (user?.steam_trade_url || '')) {
        updateData.steam_trade_url = tradeUrl;
      }

      if (newUsername && newUsername !== user?.username) {
        updateData.username = newUsername;
      }

      if (newEmail && newEmail !== user?.email) {
        updateData.email = newEmail;
      }

      // Если нет изменений, просто закрываем окно
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const result = await updateProfile(updateData).unwrap();

      // Если сервер вернул новый токен, обновляем его в localStorage
      if ('token' in result && result.token) {
        localStorage.setItem('auth_token', result.token);
        console.log('Токен обновлен после изменения профиля');
      }

      // Если email был изменен, показываем специальное уведомление и открываем окно верификации
      const emailChanged = updateData.email || ('emailChanged' in result && result.emailChanged);
      if (emailChanged) {
        showNotification(t('profile.settings.email_updated_verify_required') || 'Email обновлен. Код отправлен на почту.', 'success');
        onClose();

        // Обновляем данные пользователя
        setTimeout(() => {
          onUserRefresh();
          // Открываем модальное окно верификации email, сразу с формой ввода кода
          setTimeout(() => {
            onEmailVerificationOpen(true); // true = skipToVerify
          }, 500);
        }, 500);
      } else {
        showNotification(t('profile.settings.settings_saved'), 'success');
        onClose();

        // Обновляем данные пользователя
        setTimeout(() => {
          onUserRefresh();
        }, 500);
      }
    } catch (error: any) {
      console.error('Ошибка при сохранении настроек:', error);
      showNotification(error?.data?.message || t('profile.settings.settings_save_error'), 'error');
    }
  };

  // Функция для привязки Steam
  const handleSteamLink = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert(t('profile.settings.steam_link_error'));
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'https://chibox-game.ru';
    console.log('Попытка привязки Steam:', {
      serverUrl,
      token: token.substring(0, 20) + '...',
      fullUrl: `${serverUrl}/v1/auth/link-steam?token=${encodeURIComponent(token)}`
    });

    const steamLinkUrl = `${serverUrl}/v1/auth/link-steam?token=${encodeURIComponent(token)}`;
    window.location.href = steamLinkUrl;
    onClose();
  };

  // Функция для автоматического получения Trade URL
  const handleFetchTradeUrl = async () => {
    if (!user?.steam_id) {
      showNotification(t('profile.settings.steam_not_connected_error'), 'error');
      return;
    }

    setIsFetchingTradeUrl(true);

    try {
      const response = await fetch('/api/v1/steam/fetch-trade-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.data.steam_trade_url) {
        setTradeUrl(result.data.steam_trade_url);
        showNotification(t('profile.settings.trade_url_fetched'), 'success');
        // Обновляем данные пользователя
        setTimeout(() => {
          onUserRefresh();
        }, 500);
      } else {
        // Если не удалось получить автоматически, показываем инструкции
        const instructions = result.data?.manual_instructions;
        if (instructions) {
          showNotification(t('profile.settings.trade_url_manual_instructions'), 'info');

          // Открываем страницу настроек Steam в новой вкладке
          if (instructions.privacy_url) {
            window.open(instructions.privacy_url, '_blank');
          }
        } else {
          showNotification(t('profile.settings.trade_url_fetch_error'), 'error');
        }
      }
    } catch (error: any) {
      console.error('Ошибка при получении Trade URL:', error);
      showNotification(t('profile.settings.trade_url_fetch_network_error'), 'error');
    } finally {
      setIsFetchingTradeUrl(false);
    }
  };

  const resetForm = () => {
    // Form reset logic (if needed in the future)
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.log('Logout API error (continuing with logout):', error);
    } finally {
      performFullLogout(dispatch);
      onClose();
      navigate('/');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-[9999999] overflow-y-auto py-4 md:py-8" onClick={() => {
      onClose();
      resetForm();
    }}>
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1530] rounded-xl p-6 max-w-md w-full mx-4 my-auto border border-gray-700/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{t('profile.settings.title')}</h3>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.settings.username')}
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder={t('profile.settings.username_placeholder')}
              className={`w-full px-3 py-2 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                usernameError
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-gray-600/50 focus:border-blue-500'
              }`}
              maxLength={20}
            />
            {usernameError ? (
              <p className="text-xs text-red-400 mt-1">
                {usernameError}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                {t('profile.settings.username_description')}
              </p>
            )}
          </div>

         {/* Trade URL */}
         <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-300">
                {t('profile.settings.steam_trade_url')}
              </label>
              {user?.steam_trade_url && (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-medium">{t('profile.settings.trade_url_set')}</span>
                </div>
              )}
              {!user?.steam_trade_url && (
                <Tooltip
                  content={
                    <div className="space-y-2 text-sm max-w-xs">
                      <div className="font-semibold text-white mb-2">{t('profile.settings.trade_url_tooltip.title')}</div>
                      <div className="space-y-1 text-xs">
                        <div>{t('profile.settings.trade_url_tooltip.step1')}</div>
                        <div>{t('profile.settings.trade_url_tooltip.step2')}</div>
                        <div>{t('profile.settings.trade_url_tooltip.step3')}</div>
                        <div>{t('profile.settings.trade_url_tooltip.step4')}</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                        {t('profile.settings.trade_url_tooltip.example')}
                      </div>
                    </div>
                  }
                  position="bottom"
                >
                  <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center cursor-help hover:bg-gray-500 transition-colors">
                    <span className="text-xs text-white font-bold">?</span>
                  </div>
                </Tooltip>
              )}
            </div>

            <div className="space-y-2">
              {user?.steam_trade_url ? (
                // Если Trade URL уже установлен - показываем только для чтения
                <div className="relative">
                  <input
                    type="url"
                    value={tradeUrl}
                    readOnly
                    className="w-full px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Если Trade URL не установлен - показываем поле для ввода
                <>
                  <input
                    type="url"
                    value={tradeUrl}
                    onChange={(e) => setTradeUrl(e.target.value)}
                    placeholder={t('profile.settings.trade_url_placeholder')}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  />

                  {/* Кнопка автоматического получения Trade URL */}
                  {user.steam_id && (
                    <button
                      onClick={handleFetchTradeUrl}
                      disabled={isFetchingTradeUrl}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      {isFetchingTradeUrl ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          {t('profile.settings.fetching_trade_url')}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('profile.settings.fetch_trade_url_auto')}
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-1">
              {user?.steam_trade_url ? (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                  </svg>
                  {t('profile.settings.trade_url_locked')}
                </span>
              ) : user.steam_id ? (
                t('profile.settings.trade_url_required')
              ) : (
                t('profile.settings.connect_steam_first')
              )}
            </p>
          </div>

          {/* Steam Profile */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.settings.steam_profile_label')}
            </label>
            <button
              onClick={user.steam_id ? undefined : handleSteamLink}
              className={`w-full flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-gray-600/30 text-left transition-colors ${
                !user.steam_id ? 'hover:bg-black/30 hover:border-gray-500/50 cursor-pointer' : 'cursor-default'
              }`}
              disabled={!!user.steam_id}
            >
              {user.steam_id ? (
                <>
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{user.steam_profile?.personaname}</p>
                    <p className="text-xs text-gray-400">{t('profile.settings.steam_connected')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{t('profile.settings.connect_steam')}</p>
                    <p className="text-xs text-gray-400">{t('profile.settings.click_to_connect')}</p>
                  </div>
                  <div className="text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Email Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.settings.email_verification_label')}
            </label>

            {/* Если email редактируется */}
            {isEditingEmail ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={t('profile.settings.email_placeholder') || 'example@email.com'}
                  className={`w-full px-3 py-2 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    emailError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-gray-600/50 focus:border-blue-500'
                  }`}
                />
                {emailError && (
                  <p className="text-xs text-red-400">
                    {emailError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingEmail(false);
                      setNewEmail(user?.email || '');
                      setEmailError('');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-600/30 hover:bg-gray-600/50 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    {t('common.cancel') || 'Отмена'}
                  </button>
                  <button
                    onClick={() => {
                      if (!emailError && validateEmail(newEmail)) {
                        setIsEditingEmail(false);
                        showNotification(t('profile.settings.email_will_be_saved') || 'Email будет сохранен при нажатии кнопки "Сохранить"', 'info');
                      }
                    }}
                    disabled={!!emailError || !validateEmail(newEmail)}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                  >
                    {t('common.apply') || 'Применить'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {t('profile.settings.email_change_note') || 'После изменения email потребуется повторная верификация'}
                </p>
              </div>
            ) : (
              /* Если email не редактируется */
              <div className="space-y-2">
                <div className={`w-full flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-gray-600/30`}>
                  {user.is_email_verified ? (
                    <>
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{t('profile.settings.email_verified')}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 text-xs rounded-lg transition-colors flex-shrink-0"
                      >
                        {t('common.edit') || 'Изменить'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={`w-8 h-8 ${user.email?.endsWith('@steam.local') ? 'bg-red-500/20' : 'bg-orange-500/20'} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <svg className={`w-4 h-4 ${user.email?.endsWith('@steam.local') ? 'text-red-400' : 'text-orange-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{user.email || t('profile.settings.no_email')}</p>
                        {user.email?.endsWith('@steam.local') ? (
                          <p className="text-xs text-red-400">Steam email - измените на реальный</p>
                        ) : (
                          <p className="text-xs text-orange-400">{t('profile.settings.email_not_verified') || 'Email не подтвержден'}</p>
                        )}
                      </div>
                      {user.email?.endsWith('@steam.local') ? (
                        <button
                          onClick={() => setIsEditingEmail(true)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 text-xs rounded-lg transition-colors flex-shrink-0"
                        >
                          {t('common.edit') || 'Изменить'}
                        </button>
                      ) : (
                        <button
                          onClick={() => onEmailVerificationOpen(false)}
                          className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 text-xs rounded-lg transition-colors flex-shrink-0"
                        >
                          {t('profile.settings.verify') || 'Подтвердить'}
                        </button>
                      )}
                    </>
                  )}
                </div>
                {!user.email && (
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 text-sm rounded-lg transition-colors"
                  >
                    {t('profile.settings.add_email') || 'Добавить email'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sound Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Настройки звука
            </label>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-gray-600/30">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  soundsEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  <svg className={`w-4 h-4 ${soundsEnabled ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    {soundsEnabled ? (
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Звуковые эффекты</p>
                  <p className="text-xs text-gray-400">
                    {soundsEnabled ? 'Звуки включены' : 'Звуки выключены'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setSoundsEnabled(!soundsEnabled))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundsEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-gray-700/30">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? t('header.signing_out') : t('header.sign_out')}</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={isUpdatingProfile}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            {isUpdatingProfile ? t('profile.settings.saving') : t('common.save')}
          </button>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="px-4 py-2 bg-gray-600/30 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
