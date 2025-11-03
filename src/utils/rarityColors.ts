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
 
 export const getRarityName = (rarity: string, t?: any) => {
   if (!t) {
     // Фолбэк без перевода
     switch (rarity?.toLowerCase()) {
       case 'consumer': return 'Потребительское';
       case 'industrial': return 'Промышленное';
       case 'milspec': return 'Армейское';
       case 'restricted': return 'Запрещённое';
       case 'classified': return 'Засекреченное';
       case 'covert': return 'Тайное';
       case 'contraband': return 'Контрабанда';
       default: return rarity || 'Неизвестно';
     }
   }
 
   if (!rarity) return t('profile.rarity.unknown', { defaultValue: 'Неизвестно' });
   const rarityKey = `profile.rarity.${rarity.toLowerCase()}`;
   return t(rarityKey, { defaultValue: rarity });
 };
 