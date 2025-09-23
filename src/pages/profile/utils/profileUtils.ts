export const getRarityColor = (rarity: string) => {
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
 
 export const getRarityName = (rarity: string, t: any) => {
   if (!rarity) return t('profile.rarity.unknown', { defaultValue: 'Неизвестно' });
   const rarityKey = `profile.rarity.${rarity.toLowerCase()}`;
   return t(rarityKey, { defaultValue: rarity });
 };
 
 export const getSubscriptionName = (tier: string | number, t: any) => {
   const tierNumber = typeof tier === 'string' ? parseInt(tier) : tier;
   switch (tierNumber) {
     case 1: return t('profile.subscription_tier_1');
     case 2: return t('profile.subscription_tier_2');
     case 3: return t('profile.subscription_tier_3');
     default: return t('profile.subscription_tier_default', { tier });
   }
 };
 
 // Функция для расчета XP требований (дублирует серверную логику)
 export const calculateXpRequired = (level: number): number => {
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
 
 export const calculateLevelProgress = (user: any) => {
   const currentXp = user.xp || 0;
   const xpToNextLevel = user.xp_to_next_level || 100;
 
   // XP нужное для достижения текущего уровня
   const xpRequiredForCurrentLevel = calculateXpRequired(user.level);
 
   // XP уже набранное в текущем уровне
   const xpInCurrentLevel = Math.max(0, currentXp - xpRequiredForCurrentLevel);
 
   // Процент прогресса в текущем уровне
   const progressPercentage = xpToNextLevel > 0
     ? Math.min(100, Math.round((xpInCurrentLevel / xpToNextLevel) * 100))
     : 0;
 
   return {
     currentXp,
     xpToNextLevel,
     xpInCurrentLevel,
     progressPercentage
   };
 };
 