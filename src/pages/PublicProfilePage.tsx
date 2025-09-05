import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetPublicProfileQuery } from '../features/user/userApi';
import { useGetCaseTemplatesQuery } from '../features/cases/casesApi';
import Avatar from '../components/Avatar';
import CaseWithDrop from '../components/CaseWithDrop';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';

const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profileData, isLoading, error } = useGetPublicProfileQuery(id || '');

  // Получаем шаблоны кейсов для отображения информации о кейсах в инвентаре
  const { data: caseTemplatesData } = useGetCaseTemplatesQuery();

  // State для переключения между превью и полным отображением инвентаря
  const [showFullInventory, setShowFullInventory] = useState(false);

  // State для переключения между категориями инвентаря
  const [activeInventoryTab, setActiveInventoryTab] = useState<'active' | 'opened'>('active');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151225] to-[#1a0e2e] text-white p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-400">Загрузка профиля...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData?.user) {
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
              <p className="text-gray-400">Указанный профиль не существует или недоступен</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = profileData.user;

  // Функция для получения шаблона кейса по ID
  const getCaseTemplateById = (templateId: string) => {
    if (!caseTemplatesData?.success || !caseTemplatesData?.data) return null;
    return caseTemplatesData.data.find(template => template.id === templateId);
  };

  const getRarityColor = (rarity: string) => {
    if (!rarity) return 'from-gray-500 to-gray-600';
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
    if (!rarity) return 'Неизвестно';
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

  const getAchievementCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'from-green-500 to-green-600';
      case 'collector': return 'from-purple-500 to-purple-600';
      case 'regular': return 'from-blue-500 to-blue-600';
      case 'expert': return 'from-orange-500 to-orange-600';
      case 'legendary': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAchievementCategoryName = (category: string) => {
    switch (category) {
      case 'beginner': return 'Новичок';
      case 'collector': return 'Коллекционер';
      case 'regular': return 'Активный';
      case 'expert': return 'Эксперт';
      case 'legendary': return 'Легендарный';
      default: return category;
    }
  };

  // Найти лучшее оружие (аналогично приватному профилю)
  const bestWeapon = user.bestWeapon;
  const inventory = user.inventory || [];
  const achievements = user.achievements || [];
  const dropBonuses = user.dropBonuses || { achievements: 0, subscription: 0, level: 0, total: 0 };

  // Функции для фильтрации инвентаря
  const getActiveInventory = () => {
    return inventory.filter(item =>
      item.status !== 'sold' && item.status !== 'withdrawn' && item.status !== 'used'
    );
  };

  const getOpenedCases = () => {
    // Предметы, полученные из кейсов
    return inventory.filter(item =>
      item.source === 'case'
    );
  };

  // Получаем инвентарь в зависимости от активного таба
  const getFilteredInventory = () => {
    switch (activeInventoryTab) {
      case 'active':
        return getActiveInventory();
      case 'opened':
        return getOpenedCases();
      default:
        return getActiveInventory();
    }
  };

  const filteredInventory = getFilteredInventory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151225] to-[#1a0e2e] text-white">
      <ScrollToTopOnMount />
      <div className="container mx-auto max-w-7xl p-4 space-y-6">

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-[#1a1530] via-[#2a1f47] to-[#1a1530] rounded-2xl p-8 border border-gray-700/30 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-green-500 to-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>

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
                  {user.username || user.steam_profile?.personaname}
                </h1>
                <p className="text-gray-400 text-sm">ID: {user.id}</p>

                {/* Subscription Status */}
                {user.subscriptionStatus && user.subscriptionStatus !== 'Без статуса' && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                      {user.subscriptionStatus}
                    </span>
                  </div>
                )}

                {/* Steam Status */}
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
                  </svg>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    user.steam_profile
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {user.steam_profile ? 'Steam подключен' : 'Steam не подключен'}
                  </span>
                </div>

                {/* Registration Date */}
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-300">
                    Зарегистрирован: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Drop Bonuses */}
            <div className="flex-1 space-y-4">
              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  Бонус к дропу
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Уровень:</span>
                    <span className="text-green-400 font-bold">+{(dropBonuses.level || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Статус:</span>
                    <span className="text-blue-400 font-bold">+{(dropBonuses.subscription || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Достижения:</span>
                    <span className="text-purple-400 font-bold">+{(dropBonuses.achievements || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-white font-semibold">Общий бонус:</span>
                    <span className="text-yellow-400 font-bold">+{(dropBonuses.total || 0).toFixed(2)}%</span>
                  </div>
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
                  {user.totalCasesOpened || 0}
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
                <p className="text-xl font-bold text-white">{inventory.length}</p>
              </div>
            </div>
          </div>

          {/* Total Items Value */}
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Общая стоимость</p>
                <p className="text-xl font-bold text-white">
                  {(Number(user.totalItemsValue) || 0).toFixed(2)} КР
                </p>
              </div>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30 hover:border-orange-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ежедневная серия</p>
                <p className="text-xl font-bold text-white">
                  {user.dailyStreak || 0} дн. (макс: {user.maxDailyStreak || 0})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              Достижения ({achievements.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 6).map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="bg-black/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-400/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getAchievementCategoryColor(achievement.category)} p-1 flex items-center justify-center flex-shrink-0`}>
                      <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium mb-1 truncate" title={achievement.name}>
                        {achievement.name}
                      </h5>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getAchievementCategoryColor(achievement.category)} text-white`}>
                          {getAchievementCategoryName(achievement.category)}
                        </span>
                        <span className="text-green-400 text-sm font-bold">+{achievement.bonus_percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {achievements.length > 6 && (
                <div className="bg-black/30 rounded-xl p-4 border border-gray-600/30 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-gray-400 mb-2">+{achievements.length - 6}</div>
                  <p className="text-gray-400 text-xs text-center">Ещё достижений</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Best Weapon Section */}
        <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            Рекорд за всё время
          </h3>

          {bestWeapon ? (
            <div className="bg-black/30 rounded-xl p-6 border-2 border-transparent bg-gradient-to-r from-transparent via-transparent to-transparent hover:border-orange-500/50 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getRarityColor(bestWeapon.rarity)} p-1 flex items-center justify-center shadow-lg`}>
                  <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                    {bestWeapon.image_url ? (
                      <img
                        src={bestWeapon.image_url}
                        alt={bestWeapon.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">
                    {bestWeapon.name}
                  </h4>
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityColor(bestWeapon.rarity)} text-white`}>
                      {getRarityName(bestWeapon.rarity)}
                    </span>
                    <span className="text-green-400 font-bold text-lg">{Number(bestWeapon.price).toFixed(2)} КР</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Тип: {bestWeapon.weapon_type || 'Оружие'}
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
              <p className="text-gray-400 text-sm">Пока не установлен рекорд</p>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        {inventory.length > 0 && (
          <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Инвентарь ({filteredInventory.length} предметов)
              </h3>

              {/* Вкладки инвентаря */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveInventoryTab('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeInventoryTab === 'active'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Предметы
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getActiveInventory().length}</span>
                </button>

                <button
                  onClick={() => setActiveInventoryTab('opened')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeInventoryTab === 'opened'
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Открытые кейсы
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getOpenedCases().length}</span>
                </button>
              </div>

              {/* Описание активной вкладки */}
              <div className="mb-4 text-sm text-gray-400">
                {activeInventoryTab === 'active' && '🎮 Активные предметы пользователя'}
                {activeInventoryTab === 'opened' && '📦 Открытые кейсы - наведите на кейс, чтобы увидеть выпавший предмет'}
              </div>

              {/* Toggle Button для показа всех предметов */}
              {filteredInventory.length > 12 && (
                <button
                  onClick={() => setShowFullInventory(!showFullInventory)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {showFullInventory ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Скрыть
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Показать все
                    </>
                  )}
                </button>
              )}
            </div>

            {filteredInventory.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {activeInventoryTab === 'opened' ? (
                  // Специальный рендеринг для открытых кейсов с анимацией
                  (showFullInventory ? filteredInventory : filteredInventory.slice(0, 12)).map((inventoryItem: any) => {
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
                  })
                ) : (
                  // Обычный рендеринг для активных предметов
                  (showFullInventory ? filteredInventory : filteredInventory.slice(0, 12)).map((inventoryItem: any) => (
                    <div
                      key={inventoryItem.id}
                      className="bg-black/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-400/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(inventoryItem.item.rarity)} p-1 mb-3 flex items-center justify-center item-image-container`}>
                        <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                          {inventoryItem.item.image_url ? (
                            <img
                              src={inventoryItem.item.image_url}
                              alt={inventoryItem.item.name}
                              className="w-full h-full object-contain rounded item-image"
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
                      </div>
                      <h5 className="text-white text-xs font-medium mb-1 truncate" title={inventoryItem.item.name}>
                        {inventoryItem.item.name}
                      </h5>
                      <p className="text-green-400 text-sm font-bold">{Number(inventoryItem.item.price).toFixed(2)} КР</p>
                      <p className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(inventoryItem.item.rarity)} text-white text-center mt-2`}>
                        {getRarityName(inventoryItem.item.rarity)}
                      </p>

                      {/* Дополнительная информация о предмете */}
                      {inventoryItem.acquisition_date && (
                        <div className="mt-2 text-xs text-gray-400">
                          <p>Получен: {new Date(inventoryItem.acquisition_date).toLocaleDateString()}</p>
                          {inventoryItem.source && (
                            <p className="capitalize">Источник: {
                              inventoryItem.source === 'case' ? 'Кейс' :
                              inventoryItem.source === 'purchase' ? 'Покупка' :
                              inventoryItem.source
                            }</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Показываем карточку "Ещё предметов" только если не показываем все предметы */}
                {!showFullInventory && filteredInventory.length > 12 && (
                <div
                  className="bg-black/30 rounded-xl p-4 border border-gray-600/30 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400/50 transition-all duration-300"
                  onClick={() => setShowFullInventory(true)}
                >
                  <div className="text-2xl font-bold text-gray-400 mb-2">+{filteredInventory.length - 12}</div>
                  <p className="text-gray-400 text-xs text-center mb-2">Ещё предметов</p>
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">
                  {activeInventoryTab === 'active' && 'Нет активных предметов'}
                  {activeInventoryTab === 'opened' && 'Нет открытых кейсов'}
                </h4>
                <p className="text-gray-400 text-sm">
                  {activeInventoryTab === 'active' && 'У пользователя пока нет предметов в инвентаре'}
                  {activeInventoryTab === 'opened' && 'Пользователь пока не открывал кейсы, или предметы из кейсов были проданы'}
                </p>
              </div>
            )}

            {/* Кнопка "Показать меньше" в конце, если показан полный инвентарь */}
            {showFullInventory && filteredInventory.length > 12 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowFullInventory(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Показать меньше
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicProfilePage;
