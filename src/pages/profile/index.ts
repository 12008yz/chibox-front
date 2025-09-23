export { default as ProfilePage } from './ProfilePage';
export { default as ProfileHeader } from './components/ProfileHeader/ProfileHeader';
export { default as ProfileStats } from './components/ProfileStats/ProfileStats';
export { default as BestWeapon } from './components/BestWeapon/BestWeapon';
export { default as Inventory } from './components/Inventory/Inventory';
export { default as AchievementsCard } from './components/Achievements/AchievementsCard';
export { default as DropRateBonuses } from './components/Bonuses';
export { default as SettingsModal } from './components/Modals/SettingsModal';
export { default as EmailVerificationModal } from './components/Modals/EmailVerificationModal';

// Экспорт хуков
export { useAchievements } from './hooks/useAchievements';
export { useInventory } from './hooks/useInventory';

// Экспорт утилит
export * from './utils/profileUtils';
export { injectProfileStyles } from './utils/profileStyles';
