/**
 * Иконки для замены emoji
 * Использует библиотеку lucide-react
 */

import {
   Gamepad2,        // 🎮 - Активные предметы, игры
   Upload,          // 📤 - Выведенные предметы
   Coins,           // 💰 - Продажа, обмен, сейф
   Dices,           // 🎰 - Слоты, колесо фортуны
   Flame,           // 🔥 - Последние дропы
   Search,          // 🔍 - Поиск
   Star,            // ⭐ - Обмен
   Check,           // ✓ - Уже получен
   X,               // ✕ - Отмена
   Gift,            // 🎁 - Кейсы, бесплатный доступ
   Gem,             // 💎 - Баланс
   Circle,          // ⭕ - Крестики-нолики
   XCircle,         // ❌ - Крестики-нолики, слишком дешево
   DollarSign,      // 💸 - Продать
   PartyPopper,     // 🎉 - Поздравления
   Frown,           // 😔 - Нет удачи
   Meh,             // 😞 - Проиграли
   Handshake,       // 🤝 - Ничья
   Swords,          // ⚔️ - Ход противника
   Clock,           // ⏳ - Обработка
   ChevronRight,    // ▶ - Показать информацию
   ChevronDown,     // ▼ - Скрыть информацию
 } from 'lucide-react';
 
 // Экспорт всех иконок
 export const Icons = {
   // Основные действия
   Gamepad: Gamepad2,        // 🎮 Активные предметы, игры
   Upload,                   // 📤 Выведенные предметы
   Money: Coins,             // 💰 Продажа, обмен, сейф
   Slots: Dices,             // 🎰 Слоты, колесо фортуны
   Fire: Flame,              // 🔥 Последние дропы
   Search,                   // 🔍 Поиск
   Exchange: Star,           // ⭐ Обмен
 
   // Статусы
   Received: Check,          // ✓ Уже получен
   Cancel: X,                // ✕ Отмена
   TooLow: XCircle,          // ❌ Слишком дешево
 
   // Игры и награды
   Gift,                     // 🎁 Кейсы, бесплатный доступ
   Balance: Gem,             // 💎 Баланс
   TicTacToe: Circle,        // ⭕ Крестики-нолики
   Sell: DollarSign,         // 💸 Продать
   Celebrate: PartyPopper,   // 🎉 Поздравления
 
   // Эмоции
   Sad: Frown,               // 😔 Нет удачи
   Lost: Meh,                // 😞 Проиграли
   Draw: Handshake,          // 🤝 Ничья
 
   // Игровые действия
   OpponentTurn: Swords,     // ⚔️ Ход противника
   Processing: Clock,        // ⏳ Обработка
 
   // Навигация
   ShowInfo: ChevronRight,   // ▶ Показать информацию
   HideInfo: ChevronDown,    // ▼ Скрыть информацию
 };
 
 // Экспорт типа для TypeScript
 export type IconType = keyof typeof Icons;
 
 // Вспомогательная функция для получения иконки по имени
 export const getIcon = (name: IconType) => Icons[name];
 
 // Экспорт отдельных иконок для прямого импорта
 export {
   Gamepad2 as GamepadIcon,
   Upload as UploadIcon,
   Coins as MoneyIcon,
   Dices as SlotsIcon,
   Flame as FireIcon,
   Search as SearchIcon,
   Star as ExchangeIcon,
   Check as ReceivedIcon,
   X as CancelIcon,
   Gift as GiftIcon,
   Gem as BalanceIcon,
   Circle as TicTacToeIcon,
   XCircle as TooLowIcon,
   DollarSign as SellIcon,
   PartyPopper as CelebrateIcon,
   Frown as SadIcon,
   Meh as LostIcon,
   Handshake as DrawIcon,
   Swords as OpponentTurnIcon,
   Clock as ProcessingIcon,
   ChevronRight as ShowInfoIcon,
   ChevronDown as HideInfoIcon,
 };
 