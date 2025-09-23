import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/hooks';
import { useGetUserInventoryQuery, useGetAchievementsProgressQuery, useGetUserAchievementsQuery } from '../../features/user/userApi';
import { useGetCaseTemplatesQuery, useOpenCaseMutation } from '../../features/cases/casesApi';
import { useUserData } from '../../hooks/useUserData';
import ScrollToTop from '../../components/ScrollToTop';
import ScrollToTopOnMount from '../../components/ScrollToTopOnMount';
import PurchaseModal from '../../components/PurchaseModal';

// Импорты компонентов
import ProfileHeader from './components/ProfileHeader/ProfileHeader';
import ProfileStats from './components/ProfileStats/ProfileStats';
import BestWeapon from './components/BestWeapon/BestWeapon';
import DropRateBonuses from './components/Bonuses';
import Inventory from './components/Inventory/Inventory';
import SettingsModal from './components/Modals/SettingsModal';
import EmailVerificationModal from './components/Modals/EmailVerificationModal';

// Импорты утилит
import { injectProfileStyles } from './utils/profileStyles';

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();

  // Отладка переводов для проблемных ключей
  console.log('ProfilePage debug:', {
    currentLanguage: i18n.language,
    tradeUrlRequired: t('profile.settings.trade_url_required'),
    steamProfileLabel: t('profile.settings.steam_profile_label'),
    emailVerificationLabel: t('profile.settings.email_verification_label'),
    verifyEmailButton: t('profile.settings.verify_email_button'),
    clickToSendCode: t('profile.settings.click_to_send_code'),
    isTranslationWorking: t('profile.settings.trade_url_required') !== 'profile.settings.trade_url_required'
  });

  // State для модальных окон
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // State для отслеживания ID открываемого кейса
  const [openingCaseId, setOpeningCaseId] = useState<string | null>(null);

  // Используем кастомный хук для получения актуальных данных пользователя
  const { userData: currentUserData, isLoading: userLoading, refetch: refetchUser } = useUserData({
    refetchOnMount: true, // Всегда запрашиваем актуальные данные при заходе на страницу
  });

  // Обработка результатов Steam привязки из URL параметров
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const token = urlParams.get('token');

    if (success === 'steam_linked') {
      // Если получили новый токен, обновляем его в localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
        console.log('Токен обновлен после привязки Steam');
      }

      showNotification(t('profile.steam_linked_success'), 'success');
      // Очищаем URL от параметров
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      let errorMessage = t('profile.steam_link_error');
      switch (error) {
        case 'steam_link_failed':
          errorMessage = t('profile.steam_link_try_again');
          break;
        case 'session_expired':
          errorMessage = t('profile.session_expired');
          break;
        case 'steam_already_linked':
          errorMessage = t('profile.steam_already_linked');
          break;
        case 'not_linking_process':
          errorMessage = t('profile.linking_process_error');
          break;
        case 'link_failed':
          errorMessage = t('profile.account_linking_error');
          break;
      }
      showNotification(errorMessage, 'error');
      // Очищаем URL от параметров
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Дополнительно загружаем данные через API только если их нет в свежих данных профиля
  const { data: inventoryData, isLoading: inventoryLoading, refetch: refetchInventory } = useGetUserInventoryQuery({
    page: 1,
    limit: 1000, // Увеличиваем лимит для отображения всего инвентаря
    // Убираем фильтр по статусу, чтобы получить ВСЕ предметы (активные, проданные, обмененные, выведенные)
  }, {
    skip: userLoading // Always fetch inventory data unless user is loading
  });

  // Получаем прогресс достижений пользователя
  const { data: achievementsProgressData, isLoading: achievementsLoading } = useGetAchievementsProgressQuery(undefined, {
    skip: userLoading
  });

  // Получаем все достижения для правильного подсчета
  const { data: allAchievementsData } = useGetUserAchievementsQuery();

  // Получаем шаблоны кейсов для отображения информации о кейсах в инвентаре
  const { data: caseTemplatesData } = useGetCaseTemplatesQuery();

  // Хук для открытия кейса
  const [openCase, { isLoading: _isOpeningCase }] = useOpenCaseMutation();

  // Используем актуальные данные пользователя из currentUserData, fallback на auth.user
  const user = currentUserData || auth.user;

  // Функция для перевода названий кейсов
  const translateCaseName = (caseName: string) => {
    const translatedName = t(`case_names.${caseName}`, { defaultValue: caseName });
    return translatedName;
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

  // Функция для открытия кейса из инвентаря
  const handleOpenCase = async (inventoryItemId: string) => {
    if (openingCaseId === inventoryItemId) return;

    // Получаем инвентарь из API данных
    const rawInventory = inventoryData?.success && (inventoryData.data.items.length > 0 || inventoryData.data.cases.length > 0) ?
      [
        ...(inventoryData.data.items || []),
        ...(inventoryData.data.cases || [])
      ] : (user.inventory || []);

    // Находим кейс в инвентаре для получения информации о шаблоне
    const caseItem = rawInventory.find((item: any) =>
      item.id === inventoryItemId && item.item_type === 'case'
    );

    if (!caseItem || caseItem.item_type !== 'case') {
      showNotification(t('profile.case_not_found'), 'error');
      return;
    }

    const getCaseTemplateById = (templateId: string) => {
      if (!caseTemplatesData?.success || !caseTemplatesData?.data) return null;
      return caseTemplatesData.data.find((template: any) => template.id === templateId);
    };

    const caseTemplate = getCaseTemplateById(caseItem.case_template_id);

    if (!caseTemplate) {
      showNotification(t('profile.case_template_not_found'), 'error');
      return;
    }

    // Устанавливаем ID открываемого кейса
    setOpeningCaseId(inventoryItemId);

    try {
      const result = await openCase({ inventoryItemId }).unwrap();

      if (result.success && result.data?.item) {
        const item = result.data.item;
        showNotification(t('profile.item_received', { itemName: item.name }), 'success');

        // Автоматически обновляем инвентарь через 2 секунды
        setTimeout(async () => {
          try {
            await refetchInventory();
            console.log('Inventory automatically refreshed after case opening');
          } catch (error) {
            console.error('Failed to auto-refresh inventory:', error);
          }
        }, 2000);
      } else {
        showNotification(t('profile.item_info_error'), 'error');
      }
    } catch (error: any) {
      console.error('Ошибка при открытии кейса:', error);
      const errorMessage = error?.data?.message || error?.message || t('common.error');
      showNotification(t('profile.case_opening_error', { error: errorMessage }), 'error');
    } finally {
      setOpeningCaseId(null);
    }
  };

  // Инжектируем стили при монтировании компонента
  useEffect(() => {
    injectProfileStyles();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151225] to-[#1a0e2e] text-white p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('profile.user_not_found')}</h1>
              <p className="text-gray-400">{t('profile.please_login')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Получаем инвентарь с сортировкой: сначала кейсы, потом предметы
  const rawInventory = inventoryData?.success && (inventoryData.data.items.length > 0 || inventoryData.data.cases.length > 0) ?
    [
      ...(inventoryData.data.items || []),
      ...(inventoryData.data.cases || [])
    ] : (user.inventory || []);

  // Подсчитываем активный инвентарь для статистик
  const availableInventoryCount = rawInventory.filter((item: any) =>
    (item.status === 'inventory' || item.status === 'available') &&
    (item.item_type === 'item' || item.item_type === 'case')
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151225] to-[#1a0e2e] text-white">
      <ScrollToTopOnMount />
      <div className="container mx-auto max-w-7xl p-4 space-y-6">

        {/* Header Section */}
        <ProfileHeader
          user={user}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />

        {/* Stats Grid */}
        <ProfileStats
          user={user}
          availableInventoryCount={availableInventoryCount}
          achievementsProgressData={achievementsProgressData}
          allAchievementsData={allAchievementsData}
          achievementsLoading={achievementsLoading}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Best Weapon Section */}
          <BestWeapon
            user={user}
            inventory={rawInventory}
            inventoryLoading={inventoryLoading && !user.inventory?.length}
          />

          {/* Achievements & Quick Stats */}
          <div className="space-y-6">
            {/* Purchase Button */}
            <button
              onClick={() => {
                setIsPurchaseModalOpen(true);
              }}
              className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xl py-8 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 active:scale-95 border border-purple-400/20 hover:border-purple-400/50"
            >
              {t('profile.purchase_button')}
            </button>

            {/* Drop Rate Bonuses */}
            <DropRateBonuses user={user} />
          </div>
        </div>

        {/* Enhanced Inventory Section */}
        <Inventory
          inventoryData={rawInventory}
          caseTemplatesData={caseTemplatesData}
          inventoryLoading={inventoryLoading && !user.inventory?.length}
          onOpenCase={handleOpenCase}
          onInventoryRefresh={refetchInventory}
          onUserRefresh={refetchUser}
          translateCaseName={translateCaseName}
          openingCaseId={openingCaseId}
        />

      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUserRefresh={refetchUser}
        onEmailVerificationOpen={() => {
          setIsSettingsOpen(false);
          setIsEmailVerificationOpen(true);
        }}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
        user={user}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default ProfilePage;
