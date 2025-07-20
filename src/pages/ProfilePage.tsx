import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/hooks';
import { useGetUserInventoryQuery, useGetAchievementsProgressQuery, useGetUserAchievementsQuery, useUpdateUserProfileMutation, useResendVerificationCodeMutation, useVerifyEmailMutation } from '../features/user/userApi';
import { useGetCaseTemplatesQuery, useOpenCaseMutation } from '../features/cases/casesApi';
import { useUserData } from '../hooks/useUserData';
import Avatar from '../components/Avatar';
import Tooltip from '../components/Tooltip';
import CaseWithDrop from '../components/CaseWithDrop';
import CaseOpeningAnimation from '../components/CaseOpeningAnimation';
import ItemWithdrawBanner from '../components/ItemWithdrawBanner';
import type { UserInventoryItem, UserCaseItem, Item, CaseTemplate } from '../types/api';

const ProfilePage: React.FC = () => {
  const auth = useAuth();

  // State для переключения между категориями инвентаря
  const [activeInventoryTab, setActiveInventoryTab] = useState<'active' | 'opened' | 'withdrawn' | 'sold'>('active');

  // State для модального окна настроек
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tradeUrl, setTradeUrl] = useState('');

  // State для email верификации
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerificationStep, setEmailVerificationStep] = useState<'send' | 'verify'>('send');

  // State для уведомлений
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // State для анимации открытия кейса
  const [caseOpeningAnimation, setCaseOpeningAnimation] = useState<{
    isOpen: boolean;
    caseTemplate: CaseTemplate | null;
    wonItem: Item | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    caseTemplate: null,
    wonItem: null,
    isLoading: false
  });

  // State для отслеживания ID открываемого кейса
  const [openingCaseId, setOpeningCaseId] = useState<string | null>(null);

  // Helper функции для определения типа элемента инвентаря
  const isUserItem = (item: any): item is UserInventoryItem => {
    return item.item_type === 'item' && item.item_id !== null && item.item;
  };

  const isUserCase = (item: any): item is UserCaseItem => {
    return item.item_type === 'case' && item.case_template_id !== null;
  };

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

      showNotification('Steam аккаунт успешно привязан!', 'success');
      // Очищаем URL от параметров
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      let errorMessage = 'Ошибка при привязке Steam аккаунта';
      switch (error) {
        case 'steam_link_failed':
          errorMessage = 'Не удалось привязать Steam аккаунт. Попробуйте еще раз.';
          break;
        case 'session_expired':
          errorMessage = 'Сессия истекла. Попробуйте еще раз.';
          break;
        case 'steam_already_linked':
          errorMessage = 'Этот Steam аккаунт уже привязан к другому пользователю.';
          break;
        case 'not_linking_process':
          errorMessage = 'Ошибка процесса привязки. Попробуйте еще раз.';
          break;
        case 'link_failed':
          errorMessage = 'Произошла ошибка при привязке аккаунта.';
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
    limit: 50,
    status: 'inventory'
  }, {
    skip: userLoading // Always fetch inventory data unless user is loading
  });

  const { data: achievementsProgressData, isLoading: achievementsLoading } = useGetAchievementsProgressQuery(undefined, {
    skip: !!currentUserData?.achievements?.length || userLoading // Пропускаем если данные уже пришли из профиля
  });

  // Получаем все достижения для правильного подсчета
  const { data: allAchievementsData } = useGetUserAchievementsQuery();

  // Получаем шаблоны кейсов для отображения информации о кейсах в инвентаре
  const { data: caseTemplatesData } = useGetCaseTemplatesQuery();

  // Хук для открытия кейса
  const [openCase, { isLoading: _isOpeningCase }] = useOpenCaseMutation();

  // Хуки для работы с профилем
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [resendVerificationCode, { isLoading: isResendingCode }] = useResendVerificationCodeMutation();
  const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation();

  // Используем актуальные данные пользователя из currentUserData, fallback на auth.user
  const user = currentUserData || auth.user;

  // Синхронизируем tradeUrl с данными пользователя
  useEffect(() => {
    if (user?.steam_trade_url) {
      setTradeUrl(user.steam_trade_url);
    }
  }, [user?.steam_trade_url]);

  // Функция для получения шаблона кейса по ID
  const getCaseTemplateById = (templateId: string) => {
    if (!caseTemplatesData?.success || !caseTemplatesData?.data) return null;
    return caseTemplatesData.data.find(template => template.id === templateId);
  };

  // Функция для открытия кейса из инвентаря
  const handleOpenCase = async (inventoryItemId: string) => {
    if (openingCaseId === inventoryItemId) return;

    // Находим кейс в инвентаре для получения информации о шаблоне
    const caseItem = inventory.find(item =>
      item.id === inventoryItemId && isUserCase(item)
    );

    if (!caseItem || !isUserCase(caseItem)) {
      showNotification('Кейс не найден в инвентаре', 'error');
      return;
    }

    const caseTemplate = getCaseTemplateById(caseItem.case_template_id);

    // Устанавливаем ID открываемого кейса
    setOpeningCaseId(inventoryItemId);

    // Показываем анимацию открытия
    setCaseOpeningAnimation({
      isOpen: true,
      caseTemplate: caseTemplate || null,
      wonItem: null,
      isLoading: true
    });

    try {
      const result = await openCase({ inventoryItemId }).unwrap();

      if (result.success && result.data?.item) {
        const item = result.data.item;

        // Обновляем анимацию с выигранным предметом
        setCaseOpeningAnimation(prev => ({
          ...prev,
          wonItem: item,
          isLoading: false
        }));

        showNotification(`Поздравляем! Вы получили: ${item.name}`, 'success');

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
        setCaseOpeningAnimation({
          isOpen: false,
          caseTemplate: null,
          wonItem: null,
          isLoading: false
        });
        setOpeningCaseId(null);
        showNotification('Ошибка: Не удалось получить информацию о предмете', 'error');
      }
    } catch (error: any) {
      console.error('Ошибка при открытии кейса:', error);
      const errorMessage = error?.data?.message || error?.message || 'Неизвестная ошибка';

      setCaseOpeningAnimation({
        isOpen: false,
        caseTemplate: null,
        wonItem: null,
        isLoading: false
      });
      setOpeningCaseId(null);
      showNotification(`Ошибка при открытии кейса: ${errorMessage}`, 'error');
    }
  };

  // Функция для закрытия анимации открытия кейса
  const handleCloseCaseAnimation = async () => {
    const wonItem = caseOpeningAnimation.wonItem;

    setCaseOpeningAnimation({
      isOpen: false,
      caseTemplate: null,
      wonItem: null,
      isLoading: false
    });
    setOpeningCaseId(null);

    // Принудительно обновляем данные инвентаря и баланса
    try {
      // Добавляем небольшую задержку для завершения серверных операций
      await new Promise(resolve => setTimeout(resolve, 500));

      // Инвалидируем кеш и принудительно обновляем данные
      await Promise.all([
        refetchInventory(),
        refetchUser() // Обновляем данные пользователя
      ]);

      if (wonItem) {
        showNotification(`Предмет "${wonItem.name}" добавлен в инвентарь!`, 'success');
      } else {
        showNotification('Инвентарь обновлен!', 'success');
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      showNotification('Ошибка обновления данных. Обновите страницу.', 'error');
    }
  };

  // Функция для показа уведомлений
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Функция для сохранения настроек
  const handleSaveSettings = async () => {
    try {
      const result = await updateProfile({ steam_trade_url: tradeUrl }).unwrap();

      // Если сервер вернул новый токен, обновляем его в localStorage
      if ('token' in result && result.token) {
        localStorage.setItem('auth_token', result.token);
        console.log('Токен обновлен после изменения профиля');
      }

      showNotification('Настройки сохранены успешно!', 'success');
      setIsSettingsOpen(false);
    } catch (error: any) {
      console.error('Ошибка при сохранении настроек:', error);
      showNotification(error?.data?.message || 'Не удалось сохранить настройки', 'error');
    }
  };

  // Функция для привязки Steam
  const handleSteamLink = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Ошибка: токен авторизации не найден. Пожалуйста, войдите в систему заново.');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('Попытка привязки Steam:', {
      serverUrl,
      token: token.substring(0, 20) + '...',
      fullUrl: `${serverUrl}/v1/auth/link-steam?token=${encodeURIComponent(token)}`
    });

    // Попробуем сначала с window.location вместо window.open
    const steamLinkUrl = `${serverUrl}/v1/auth/link-steam?token=${encodeURIComponent(token)}`;
    window.location.href = steamLinkUrl;
    setIsSettingsOpen(false);
  };

  // Функция для отправки кода подтверждения email
  const handleSendVerificationCode = async () => {
    if (!user?.email) return;

    try {
      await resendVerificationCode({ email: user.email }).unwrap();
      setEmailVerificationStep('verify');
      alert('Код подтверждения отправлен на ваш email!');
    } catch (error: any) {
      console.error('Ошибка при отправке кода:', error);
      alert(`Ошибка: ${error?.data?.message || 'Не удалось отправить код'}`);
    }
  };

  // Функция для подтверждения email
  const handleVerifyEmail = async () => {
    if (!user?.email || !verificationCode.trim()) return;

    try {
      await verifyEmail({
        email: user.email,
        verificationCode: verificationCode.trim()
      }).unwrap();
      alert('Email успешно подтвержден!');
      setIsEmailVerificationOpen(false);
      setVerificationCode('');
      setEmailVerificationStep('send');
    } catch (error: any) {
      console.error('Ошибка при подтверждении email:', error);
      alert(`Ошибка: ${error?.data?.message || 'Неверный код подтверждения'}`);
    }
  };

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
              <h1 className="text-2xl font-bold mb-2">Пользователь не найден</h1>
              <p className="text-gray-400">Пожалуйста, войдите в систему</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Расчет прогресса и оставшегося опыта на основе серверной логики
  const currentXp = user.xp || 0;
  const xpToNextLevel = user.xp_to_next_level || 100;

  // Функция для расчета XP требований (дублирует серверную логику)
  const calculateXpRequired = (level: number): number => {
    let totalXpRequired = 0;

    for (let i = 1; i < level; i++) {
      let xpForThisLevel;

      if (i <= 10) {
        xpForThisLevel = 100 + (i - 1) * 50;
      } else if (i <= 25) {
        xpForThisLevel = 500 + (i - 10) * 100;
      } else if (i <= 50) {
        xpForThisLevel = 2000 + (i - 25) * 200;
      } else if (i <= 75) {
        xpForThisLevel = 7000 + (i - 50) * 400;
      } else {
        xpForThisLevel = 17000 + (i - 75) * 800;
      }

      totalXpRequired += xpForThisLevel;
    }

    return totalXpRequired;
  };

  // XP нужное для достижения текущего уровня
  const xpRequiredForCurrentLevel = calculateXpRequired(user.level);

  // XP уже набранное в текущем уровне
  const xpInCurrentLevel = Math.max(0, currentXp - xpRequiredForCurrentLevel);

  // Процент прогресса в текущем уровне
  const progressPercentage = xpToNextLevel > 0
    ? Math.min(100, Math.round((xpInCurrentLevel / xpToNextLevel) * 100))
    : 0;

  // Получаем инвентарь и достижения - приоритет данным из API (содержат items и cases)

  // Получаем инвентарь с сортировкой: сначала кейсы, потом предметы
  const rawInventory = inventoryData?.success && (inventoryData.data.items.length > 0 || inventoryData.data.cases.length > 0) ?
    [
      ...(inventoryData.data.items || []),
      ...(inventoryData.data.cases || [])
    ] : (user.inventory || []);

  // Сортируем инвентарь: кейсы первыми, затем остальные предметы
  // Создаем копию массива для безопасной сортировки
  const inventory = [...rawInventory].sort((a, b) => {
    // Если один элемент - кейс, а другой - нет, кейс идет первым
    if (a.item_type === 'case' && b.item_type !== 'case') return -1;
    if (a.item_type !== 'case' && b.item_type === 'case') return 1;

    // Если оба кейсы или оба предметы, сортируем по дате получения (новые первыми)
    const dateA = new Date(a.acquisition_date || 0);
    const dateB = new Date(b.acquisition_date || 0);
    return dateB.getTime() - dateA.getTime();
  });


  const achievementsProgress = user.achievements?.length
    ? user.achievements
    : (achievementsProgressData?.success ? achievementsProgressData.data : []);

  // Общее количество достижений в системе
  const totalAchievements = allAchievementsData?.success ? allAchievementsData.data.length : 8; // fallback к 8

  // Завершенные достижения
  const completedAchievementsCount = achievementsProgress.filter((ach: any) => ach.is_completed).length;

  // Находим самый дорогой предмет как "лучшее оружие"
  const bestWeapon = inventory
    .filter((item): item is UserInventoryItem => item.status === 'inventory' && isUserItem(item) && !!item.item.price)
    .sort((a, b) => parseFloat(String(b.item.price)) - parseFloat(String(a.item.price)))[0];

  // Функции для фильтрации инвентаря по разным категориям
  const getActiveInventory = () => {
    return inventory.filter(item =>
      (item.status === 'inventory' || item.status === 'available') && (isUserItem(item) || isUserCase(item))
    );
  };

  const getOpenedCases = () => {
    // Предметы, полученные из кейсов
    return inventory.filter(item =>
      isUserItem(item) && item.source === 'case'
    ) as UserInventoryItem[];
  };

  const getWithdrawnItems = () => {
    return inventory.filter(item =>
      isUserItem(item) && (item.status === 'withdrawn' || item.status === 'pending_withdrawal')
    );
  };

  const getSoldItems = () => {
    return inventory.filter(item =>
      isUserItem(item) && (item.status === 'sold' || item.status === 'used')
    );
  };

  // Получаем инвентарь в зависимости от активного таба
  const getFilteredInventory = () => {
    switch (activeInventoryTab) {
      case 'active':
        return getActiveInventory();
      case 'opened':
        return getOpenedCases();
      case 'withdrawn':
        return getWithdrawnItems();
      case 'sold':
        return getSoldItems();
      default:
        return getActiveInventory();
    }
  };

  const filteredInventory = getFilteredInventory();

  // Для обратной совместимости (используется в bestWeapon)
  const availableInventory = getActiveInventory();

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'consumer': return 'from-gray-500 to-gray-600';
      case 'industrial': return 'from-blue-500 to-blue-600';
      case 'milspec': return 'from-purple-500 to-purple-600';
      case 'restricted': return 'from-pink-500 to-pink-600';
      case 'classified': return 'from-red-500 to-red-600';
      case 'covert': return 'from-yellow-500 to-orange-500';
      case 'contraband': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'consumer': return 'Потребительское';
      case 'industrial': return 'Промышленное';
      case 'milspec': return 'Армейское';
      case 'restricted': return 'Запрещённое';
      case 'classified': return 'Засекреченное';
      case 'covert': return 'Тайное';
      case 'contraband': return 'Контрабанда';
      default: return rarity;
    }
  };

  const getSubscriptionName = (tier: string | number) => {
    const tierNumber = typeof tier === 'string' ? parseInt(tier) : tier;
    switch (tierNumber) {
      case 1: return 'Статус';
      case 2: return 'Статус+';
      case 3: return 'Статус++';
      default: return `Tier ${tier}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151225] to-[#1a0e2e] text-white">
      <div className="container mx-auto max-w-7xl p-4 space-y-6">

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-[#1a1530] via-[#2a1f47] to-[#1a1530] rounded-2xl p-8 border border-gray-700/30 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-green-500 to-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors border border-gray-600/50 hover:border-gray-500 z-10"
            title="Настройки профиля"
          >
            <svg className="w-5 h-5 text-gray-300 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.807-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-1 flex items-center justify-center">
                  <Avatar
                    steamAvatar={user.steam_avatar}
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
                  {user.steam_profile?.personaname || user.username}
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
                    {user.steam_id ? 'Steam подключен' : 'Steam не подключен'}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance and Level Progress */}
            <div className="flex-1 space-y-4">
              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Баланс</span>
                  <span className="text-2xl font-bold text-green-400">
                    {Number(user.balance).toFixed(2)} КР
                  </span>
                </div>
              </div>

              {/* Level Progress */}
              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Прогресс уровня</span>
                    <Tooltip
                      content={
                        <div className="space-y-2">
                          <div className="font-semibold text-white mb-2">Опыт начисляется за:</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span>Открытие кейсов</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span>Выполнение достижений</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>Ежедневный вход в игру</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Покупки в магазине</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              <span>Участие в событиях</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                              <span>Приглашение друзей</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                            Повышение уровня увеличивает бонус к дропу: +0.02% за каждый уровень
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
                  <span>Уровень {user.level}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cases Opened */}
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Кейсов открыто</p>
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
                <p className="text-gray-400 text-sm">Предметов в инвентаре</p>
                <p className="text-xl font-bold text-white">{availableInventory.length}</p>
              </div>
            </div>
          </div>

          {/* Achievements - Interactive */}
          <div className="group relative bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl border border-gray-700/30 hover:border-green-500/50 transition-all duration-300 overflow-hidden">
            {/* Main Achievement Card */}
            <div className="p-6 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Достижения</p>
                  <p className="text-xl font-bold text-white">
                    {completedAchievementsCount}
                    <span className="text-gray-400 text-sm">/{totalAchievements}</span>
                  </p>
                </div>
                <div className="text-green-400 group-hover:translate-y-1 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Progress Preview */}
              <div className="mt-3">
                <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.round((completedAchievementsCount / totalAchievements) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{Math.round((completedAchievementsCount / totalAchievements) * 100)}% завершено</span>
                  <span>Наведите для подробностей</span>
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            <div className="absolute top-full left-0 right-0 bg-gradient-to-br from-[#1a1530] to-[#2a1f47] border-t border-gray-700/30 rounded-b-xl max-h-0 group-hover:max-h-[600px] overflow-hidden transition-all duration-500 ease-in-out z-50 shadow-2xl">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {(achievementsLoading && !user.achievements?.length) ? (
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
                        // Проверяем, что achievement и achievement.achievement существуют
                        if (!achievement || !achievement.achievement) {
                          return null;
                        }

                        const isCompleted = achievement.is_completed;
                        const progress = achievement.current_progress || 0;
                        const target = (achievement.achievement as any)?.requirement_value || 1;
                        const progressPercentage = Math.min(100, Math.round((progress / target) * 100));

                        return (
                          <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                              isCompleted
                                ? 'bg-green-500/10 border-green-500/30 shadow-sm shadow-green-500/20'
                                : 'bg-gray-700/20 border-gray-600/30 hover:border-gray-500/50'
                            }`}
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: 'slideInFromTop 0.3s ease-out forwards'
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
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>

                              {/* Achievement Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h5 className="font-medium text-white text-sm leading-tight">
                                    {achievement.achievement?.name || 'Неизвестное достижение'}
                                  </h5>
                                  {isCompleted && (
                                    <div className="flex items-center gap-1 text-xs text-green-400 flex-shrink-0">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      <span>Выполнено</span>
                                    </div>
                                  )}
                                </div>

                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                  {achievement.achievement?.description || 'Описание отсутствует'}
                                </p>

                                {/* Progress */}
                                {!isCompleted && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-400">
                                      <span>
                                        {progress}/{target}
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
                    <p className="text-gray-400 text-sm">Нет достижений</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {user.subscription_tier ? (
                    <>
                      {getSubscriptionName(user.subscription_tier)}
                      <span className="text-gray-400 text-sm block">
                        {user.subscription_days_left} дней
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 text-base">Нет</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Best Weapon Section */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              Лучшее выбитое оружие
            </h3>

            {(inventoryLoading && !user.inventory?.length) ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Загрузка...</p>
              </div>
            ) : bestWeapon && isUserItem(bestWeapon) ? (
              <div className="bg-black/30 rounded-xl p-6 border-2 border-transparent bg-gradient-to-r from-transparent via-transparent to-transparent hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getRarityColor(bestWeapon.item.rarity)} p-1 flex items-center justify-center shadow-lg`}>
                    {bestWeapon.item.image_url ? (
                      <img
                        src={bestWeapon.item.image_url}
                        alt={bestWeapon.item.name}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center" style={{ display: bestWeapon.item.image_url ? 'none' : 'flex' }}>
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{bestWeapon.item.name}</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityColor(bestWeapon.item.rarity)} text-white`}>
                        {getRarityName(bestWeapon.item.rarity)}
                      </span>
                      <span className="text-green-400 font-bold text-lg">{Number(bestWeapon.item.price).toFixed(2)} КР</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Получено: {new Date((bestWeapon as any).acquisition_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Пока нет выбитого оружия</p>
                <p className="text-gray-500 text-xs mt-1">Откройте кейсы, чтобы получить первое оружие</p>
              </div>
            )}
          </div>

          {/* Achievements & Quick Stats */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                Достижения
              </h4>

              {(achievementsLoading && !user.achievements?.length) ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Загрузка...</p>
                </div>
              ) : achievementsProgress.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {achievementsProgress.slice(0, 5).map((achievement) => {
                    // Проверяем, что achievement и achievement.achievement существуют
                    if (!achievement || !achievement.achievement) {
                      return null;
                    }

                    return (
                      <div key={achievement.id} className={`p-3 rounded-lg border ${
                        achievement.is_completed
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-gray-700/30 border-gray-600/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            achievement.is_completed ? 'bg-green-400' : 'bg-gray-500'
                          }`}></div>
                          <h5 className="font-medium text-sm text-white">
                            {achievement.achievement?.name || 'Неизвестное достижение'}
                          </h5>
                        </div>
                        <p className="text-xs text-gray-400">
                          {achievement.achievement?.description || 'Описание отсутствует'}
                        </p>
                        {!achievement.is_completed && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-400 mb-1">
                              Прогресс: {achievement.current_progress || 0}/
                              {(achievement.achievement as any)?.requirement_value || 1}
                            </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, (achievement.current_progress / ((achievement.achievement as any).requirement_value || 1)) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    )
                  }).filter(Boolean)}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Нет достижений</p>
              )}
            </div>

            {/* Drop Rate Bonuses */}
            <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
              <h4 className="text-lg font-semibold mb-3">Бонусы к дропу</h4>
              <div className="space-y-2">
                {(user.level_bonus_percentage ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Уровень:</span>
                    <span className="text-green-400 text-sm">+{parseFloat(Number(user.level_bonus_percentage).toFixed(2))}%</span>
                  </div>
                )}
                {(user.subscription_bonus_percentage ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Статус:</span>
                    <span className="text-blue-400 text-sm">+{parseFloat(Number(user.subscription_bonus_percentage).toFixed(2))}%</span>
                  </div>
                )}
                {(user.achievements_bonus_percentage ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Достижения:</span>
                    <span className="text-purple-400 text-sm">+{parseFloat(Number(user.achievements_bonus_percentage).toFixed(2))}%</span>
                  </div>
                )}
                {(user.total_drop_bonus_percentage ?? 0) > 0 && (
                  <div className="border-t border-gray-600/30 pt-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold text-sm">Итого:</span>
                      <span className="text-yellow-400 font-semibold text-sm">
                        +{parseFloat(Number(user.total_drop_bonus_percentage || 0).toFixed(2))}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Inventory Section */}
        <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            Инвентарь
          </h3>

          {/* Inventory Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 p-1 bg-black/20 rounded-lg border border-gray-700/30">
            <button
              onClick={() => setActiveInventoryTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeInventoryTab === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Активные
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getActiveInventory().length}</span>
            </button>

            <button
              onClick={() => setActiveInventoryTab('opened')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeInventoryTab === 'opened'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Открытые кейсы
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getOpenedCases().length}</span>
            </button>

            <button
              onClick={() => setActiveInventoryTab('withdrawn')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeInventoryTab === 'withdrawn'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Выведенные
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getWithdrawnItems().length}</span>
            </button>

            <button
              onClick={() => setActiveInventoryTab('sold')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeInventoryTab === 'sold'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Обменённые
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getSoldItems().length}</span>
            </button>
          </div>

          {/* Tab Description */}
          <div className="mb-4 p-3 bg-black/20 rounded-lg border border-gray-700/30">
            <p className="text-sm text-gray-300">
              {activeInventoryTab === 'active' && '🎮 Ваши текущие предметы и неоткрытые кейсы'}
              {activeInventoryTab === 'opened' && '📦 Открытые кейсы - наведите на кейс, чтобы увидеть выпавший предмет'}
              {activeInventoryTab === 'withdrawn' && '📤 Предметы на выводе: ожидающие отправки и уже отправленные в Steam'}
              {activeInventoryTab === 'sold' && '💰 Предметы, проданные за валюту или обмененные на подписку'}
            </p>
          </div>

          {/* Inventory Content */}
          {(inventoryLoading && !user.inventory?.length) ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка инвентаря...</p>
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {activeInventoryTab === 'opened' ? (
                // Специальный рендеринг для открытых кейсов с анимацией
                filteredInventory.slice(0, 24).map((inventoryItem) => {
                  if (isUserItem(inventoryItem)) {
                    const caseTemplate = inventoryItem.case_template_id
                      ? getCaseTemplateById(inventoryItem.case_template_id)
                      : null;

                    return (
                      <CaseWithDrop
                        key={inventoryItem.id}
                        droppedItem={inventoryItem}
                        caseTemplate={caseTemplate}
                      />
                    );
                  }
                  return null;
                })
              ) : (
                // Обычный рендеринг для остальных табов
                filteredInventory.slice(0, 24).map((inventoryItem) => (
                  <div
                    key={inventoryItem.id}
                    className={`bg-black/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-400/50 transition-all duration-300 hover:scale-105 relative group ${
                      activeInventoryTab !== 'active' ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Status Badge */}
                    {activeInventoryTab !== 'active' && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${
                          activeInventoryTab === 'withdrawn' ?
                            (inventoryItem.status === 'pending_withdrawal' ? 'bg-orange-500' : 'bg-purple-500') :
                          activeInventoryTab === 'sold' ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}>
                          {activeInventoryTab === 'withdrawn' ?
                            (inventoryItem.status === 'pending_withdrawal' ? 'Ожидает отправки' : 'Выведен') :
                           activeInventoryTab === 'sold' ? 'Продан' :
                           'Открыт'}
                        </div>
                      </div>
                    )}

                    {isUserItem(inventoryItem) ? (
                      // Рендеринг предмета
                      <>
                        <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(inventoryItem.item.rarity)} p-1 mb-3 flex items-center justify-center`}>
                          {inventoryItem.item.image_url ? (
                            <img
                              src={inventoryItem.item.image_url}
                              alt={inventoryItem.item.name}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) nextElement.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center" style={{ display: inventoryItem.item.image_url ? 'none' : 'flex' }}>
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <h5 className="text-white text-xs font-medium mb-1 truncate" title={inventoryItem.item.name}>
                          {inventoryItem.item.name}
                        </h5>
                        <p className="text-green-400 text-sm font-bold">{Number(inventoryItem.item.price).toFixed(2)} КР</p>
                        <p className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(inventoryItem.item.rarity)} text-white text-center mt-2`}>
                          {getRarityName(inventoryItem.item.rarity)}
                        </p>
                        {/* Acquisition info */}
                        <div className="mt-2 text-xs text-gray-400">
                          <p>Получен: {new Date((inventoryItem as any).acquisition_date).toLocaleDateString()}</p>
                          <p className="capitalize">Источник: {
                            inventoryItem.source === 'case' ? 'Кейс' :
                            inventoryItem.source === 'purchase' ? 'Покупка' :
                            inventoryItem.source
                          }</p>
                        </div>

                        {/* Withdraw Banner - показывается только для активных предметов */}
                        {activeInventoryTab === 'active' && inventoryItem.status === 'inventory' && (
                          <ItemWithdrawBanner
                            item={inventoryItem}
                            onWithdrawSuccess={() => {
                              showNotification(`Предмет "${inventoryItem.item.name}" успешно отправлен на вывод!`, 'success');
                              // Обновляем данные пользователя и инвентарь
                              setTimeout(() => {
                                refetchInventory();
                                refetchUser();
                              }, 100);
                            }}
                            onError={(message) => {
                              showNotification(message, 'error');
                            }}
                          />
                        )}
                      </>
                    ) : isUserCase(inventoryItem) ? (
                      // Рендеринг кейса
                      (() => {
                        const caseTemplate = getCaseTemplateById(inventoryItem.case_template_id);
                        const caseName = caseTemplate?.name || `Кейс #${inventoryItem.case_template_id.slice(0, 8)}`;
                        const casePrice = caseTemplate?.price || '0.00';
                        const caseImageUrl = caseTemplate?.image_url;

                        return (
                          <>
                            <div
                              className={`w-full aspect-square rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-1 mb-3 flex items-center justify-center transition-all duration-300 ${
                                activeInventoryTab === 'active' && inventoryItem.status === 'inventory' && openingCaseId !== inventoryItem.id
                                  ? 'cursor-pointer hover:from-yellow-400 hover:to-orange-500'
                                  : 'cursor-not-allowed opacity-60'
                              }`}
                              onClick={() => {
                                if (activeInventoryTab === 'active' && inventoryItem.status === 'inventory' && openingCaseId !== inventoryItem.id) {
                                  handleOpenCase(inventoryItem.id);
                                }
                              }}
                            >
                              {caseImageUrl ? (
                                <img
                                  src={caseImageUrl}
                                  alt={caseName}
                                  className="w-full h-full object-contain rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) nextElement.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center" style={{ display: caseImageUrl ? 'none' : 'flex' }}>
                                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <h5 className="text-white text-xs font-medium mb-1 truncate" title={caseName}>
                              {caseName}
                            </h5>
                            <p className="text-yellow-400 text-sm font-bold">{Number(casePrice).toFixed(2)} КР</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                                КЕЙС
                              </p>
                              {activeInventoryTab === 'active' && inventoryItem.status === 'inventory' && (
                                <button
                                  className={`text-xs px-2 py-1 text-white rounded-full transition-colors duration-200 ${
                                    openingCaseId === inventoryItem.id
                                      ? 'bg-gray-500 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-500'
                                  }`}
                                  disabled={openingCaseId === inventoryItem.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openingCaseId !== inventoryItem.id) {
                                      handleOpenCase(inventoryItem.id);
                                    }
                                  }}
                                >
                                  {openingCaseId === inventoryItem.id ? 'Открываем...' : 'Открыть'}
                                </button>
                              )}
                            </div>
                            {/* Acquisition info */}
                            <div className="mt-2 text-xs text-gray-400">
                              <p>Получен: {new Date((inventoryItem as any).acquisition_date).toLocaleDateString()}</p>
                              <p className="capitalize">Источник: {
                                inventoryItem.source === 'case' ? 'Кейс' :
                                inventoryItem.source === 'purchase' ? 'Покупка' :
                                inventoryItem.source
                              }</p>
                            </div>
                          </>
                        );
                      })()
                    ) : null}
                  </div>
                ))
              )}
              {filteredInventory.length > 24 && (
                <div className="bg-black/30 rounded-xl p-4 border border-gray-600/30 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-gray-400 mb-2">+{filteredInventory.length - 24}</div>
                  <p className="text-gray-400 text-xs text-center">Ещё предметов</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  {activeInventoryTab === 'active' ? (
                    <>
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </>
                  ) : activeInventoryTab === 'opened' ? (
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  ) : activeInventoryTab === 'withdrawn' ? (
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <p className="text-gray-400 text-lg">
                {activeInventoryTab === 'active' && 'Инвентарь пуст'}
                {activeInventoryTab === 'opened' && 'Нет открытых кейсов'}
                {activeInventoryTab === 'withdrawn' && 'Нет выведенных предметов'}
                {activeInventoryTab === 'sold' && 'Нет обмененных предметов'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {activeInventoryTab === 'active' && 'Откройте кейсы, чтобы получить предметы'}
                {activeInventoryTab === 'opened' && 'Открытые кейсы будут отображаться здесь с возможностью увидеть выпавший предмет'}
                {activeInventoryTab === 'withdrawn' && 'Предметы на выводе и выведенные в Steam будут отображаться здесь'}
                {activeInventoryTab === 'sold' && 'Проданные и обмененные предметы будут отображаться здесь'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Настройки профиля</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Trade URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam Trade URL
                </label>
                <input
                  type="url"
                  value={tradeUrl}
                  onChange={(e) => setTradeUrl(e.target.value)}
                  placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Необходим для автоматической отправки предметов
                </p>
              </div>

              {/* Steam Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam Профиль
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
                        <p className="text-xs text-gray-400">Steam подключен</p>
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
                        <p className="text-sm text-white">Подключить Steam</p>
                        <p className="text-xs text-gray-400">Нажмите для привязки аккаунта</p>
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
                  Email подтверждение
                </label>
                <button
                  onClick={user.is_email_verified ? undefined : () => setIsEmailVerificationOpen(true)}
                  className={`w-full flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-gray-600/30 text-left transition-colors ${
                    !user.is_email_verified ? 'hover:bg-black/30 hover:border-gray-500/50 cursor-pointer' : 'cursor-default'
                  }`}
                  disabled={user.is_email_verified}
                >
                  {user.is_email_verified ? (
                    <>
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Email подтвержден</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Подтвердить Email</p>
                        <p className="text-xs text-gray-400">Нажмите для отправки кода</p>
                      </div>
                      <div className="text-orange-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSettings}
                disabled={isUpdatingProfile}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                {isUpdatingProfile ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-gray-600/30 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {isEmailVerificationOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEmailVerificationOpen(false)}>
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Подтверждение Email</h3>
              <button
                onClick={() => {
                  setIsEmailVerificationOpen(false);
                  setEmailVerificationStep('send');
                  setVerificationCode('');
                }}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {emailVerificationStep === 'send' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Отправим код подтверждения на:
                  </p>
                  <p className="text-white font-semibold mb-4">
                    {user?.email}
                  </p>
                  <p className="text-sm text-gray-400">
                    Код действителен в течение 15 минут
                  </p>
                </div>

                <button
                  onClick={handleSendVerificationCode}
                  disabled={isResendingCode}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  {isResendingCode ? 'Отправка кода...' : 'Отправить код'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-2">
                    Код отправлен!
                  </p>
                  <p className="text-gray-300 mb-4">
                    Введите 6-значный код из письма
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-lg text-white text-center text-lg font-mono tracking-widest placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingEmail || verificationCode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    {isVerifyingEmail ? 'Проверка...' : 'Подтвердить'}
                  </button>
                  <button
                    onClick={handleSendVerificationCode}
                    disabled={isResendingCode}
                    className="px-4 py-3 bg-gray-600/30 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    {isResendingCode ? '...' : 'Повторить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Opening Animation */}
      <CaseOpeningAnimation
        isOpen={caseOpeningAnimation.isOpen}
        onClose={handleCloseCaseAnimation}
        caseTemplate={caseOpeningAnimation.caseTemplate}
        wonItem={caseOpeningAnimation.wonItem}
        isLoading={caseOpeningAnimation.isLoading}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full px-6 py-4 rounded-lg shadow-lg border transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
          notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
          'bg-blue-500/90 border-blue-400 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : notification.type === 'error' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 ml-auto text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
