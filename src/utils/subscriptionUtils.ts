import type { User } from '../types/api';

/**
 * Проверяет, имеет ли пользователь действующую подписку
 */
export function hasActiveSubscription(user: User | null): boolean {
  if (!user) return false;

  // Проверяем количество оставшихся дней
  if (user.subscription_days_left && user.subscription_days_left > 0) {
    return true;
  }

  // Дополнительная проверка по дате истечения
  if (user.subscription_expiry_date) {
    const expiryDate = new Date(user.subscription_expiry_date);
    const now = new Date();
    return expiryDate > now;
  }

  return false;
}

/**
 * Получает статус подписки в читаемом формате
 */
export function getSubscriptionStatus(user: User | null): {
  hasSubscription: boolean;
  daysLeft: number;
  statusText: string;
  isExpiring: boolean; // осталось меньше 3 дней
} {
  if (!user) {
    return {
      hasSubscription: false,
      daysLeft: 0,
      statusText: 'Подписка отсутствует',
      isExpiring: false
    };
  }

  const hasSubscription = hasActiveSubscription(user);
  const daysLeft = user.subscription_days_left || 0;

  if (!hasSubscription) {
    return {
      hasSubscription: false,
      daysLeft: 0,
      statusText: 'Подписка отсутствует',
      isExpiring: false
    };
  }

  const isExpiring = daysLeft <= 3 && daysLeft > 0;
  let statusText = `${daysLeft} дней подписки`;

  if (daysLeft === 1) {
    statusText = 'Последний день подписки';
  } else if (daysLeft === 0) {
    statusText = 'Подписка истекает сегодня';
  }

  return {
    hasSubscription,
    daysLeft,
    statusText,
    isExpiring
  };
}

/**
 * Проверяет, может ли пользователь выводить предметы
 */
export function canWithdrawItems(user: User | null): {
  canWithdraw: boolean;
  reason?: string;
  requiresSubscription: boolean;
} {
  if (!user) {
    return {
      canWithdraw: false,
      reason: 'Пользователь не авторизован',
      requiresSubscription: false
    };
  }

  if (!hasActiveSubscription(user)) {
    return {
      canWithdraw: false,
      reason: 'Для вывода предметов требуется действующая подписка',
      requiresSubscription: true
    };
  }

  return {
    canWithdraw: true,
    requiresSubscription: false
  };
}

/**
 * Получает предупреждение о подписке для отображения в UI
 */
export function getSubscriptionWarning(user: User | null): {
  showWarning: boolean;
  type: 'none' | 'missing' | 'expiring';
  title: string;
  message: string;
  actionText?: string;
} {
  const { hasSubscription, daysLeft, isExpiring } = getSubscriptionStatus(user);

  if (!hasSubscription) {
    return {
      showWarning: true,
      type: 'missing',
      title: 'Подписка отсутствует',
      message: 'Для вывода предметов в Steam необходима действующая подписка',
      actionText: 'Купить подписку'
    };
  }

  if (isExpiring) {
    return {
      showWarning: true,
      type: 'expiring',
      title: 'Подписка истекает',
      message: `Ваш статус истекает через ${daysLeft} дней. Продлите подписку, чтобы продолжить выводить предметы`,
      actionText: 'Продлить подписку'
    };
  }

  return {
    showWarning: false,
    type: 'none',
    title: '',
    message: ''
  };
}
