import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useGetUserNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from '../../../features/user/userApi';
import type { Notification } from '../../../types/api';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaCog, FaUsers, FaComments, FaGift, FaBox, FaTimes } from 'react-icons/fa';
import LanguageSwitcher from '../../LanguageSwitcher';

interface NotificationsProps {
    openNotifications: boolean;
    setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notifications: React.FC<NotificationsProps> = ({ openNotifications, setOpenNotifications }) => {
    const { t } = useTranslation();
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Получаем уведомления из API
    const {
        data: notificationsData,
        refetch: refetchNotifications
    } = useGetUserNotificationsQuery({ limit: 20 }, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        pollingInterval: openNotifications ? 3000 : 0, // Обновляем каждые 3 секунды когда панель открыта
    });

    // Мутации для работы с  уведомлениями
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

    const notifications = notificationsData?.data?.items || [];

    // Подсчитаем непрочитанные уведомления
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleCloseNotifications = () => {
        // Отмечаем все уведомления как прочитанные при закрытии панели
        if (unreadCount > 0) {
            markAllAsRead().unwrap()
                .then(() => {
                    // Обновляем данные после прочтения
                    setTimeout(() => {
                        refetchNotifications();
                    }, 100);
                })
                .catch(() => {
                });
        }

        setOpenNotifications(false);
    };

    // Отметить уведомление как прочитанное
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId).unwrap();
            refetchNotifications();
        } catch {
        }
    };

    // Отметить все уведомления как прочитанные
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
            refetchNotifications();
        } catch {
        }
    };

    // Обработка клика по уведомлению
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }

        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                // Проверяем, что клик не по backdrop (так как у backdrop есть свой обработчик)
                const target = event.target as Element;
                if (!target.closest('.gaming-notifications-container') && !target.classList.contains('fixed')) {
                    handleCloseNotifications();
                }
            }
        };

        if (openNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openNotifications, unreadCount, markAllAsRead, refetchNotifications]);

    // Функция для перевода названий кейсов
    const translateCaseName = (caseName: string) => {
        const translatedName = t(`case_names.${caseName}`, { defaultValue: caseName });
        return translatedName;
    };

    // Улучшенная логика определения типа уведомления
    const detectNotificationType = (notification: Notification, translated: { title: string, message: string | any }) => {
        const { title } = translated;

        // Success: Покупка кейса, повышение уровня, достижение, бонус получен, приветствие
        if (
            /покупка кейсов|case purchase|повышение уровня|level up|достижение|achievement|бонус|bonus|добро пожаловать|welcome/i.test(title)
        ) {
            return 'success';
        }

        // Info: Новый кейс получен, кейс открыт, вывод предмета
        if (
            /новый кейс получен|new case received|кейс открыт|case opened|запрос на вывод предмета|item withdrawal/i.test(title)
        ) {
            return 'info';
        }

        // Bonus: бонус
        if (/бонус|bonus/i.test(title)) {
            return 'bonus';
        }

        // Case open: кейс открыт
        if (/кейс открыт|case opened/i.test(title)) {
            return 'caseOpen';
        }

        // Warning: предупреждение, alert, warning
        if (/предупреждение|alert|warning/i.test(title)) {
            return 'warning';
        }

        // Error: ошибка, error
        if (/ошибка|error/i.test(title)) {
            return 'error';
        }

        // System: system
        if (/system|система/i.test(title)) {
            return 'system';
        }

        // Friend request
        if (/друг|friend/i.test(title)) {
            return 'friendRequest';
        }

        // Message
        if (/сообщение|message/i.test(title)) {
            return 'message';
        }

        // Default
        return notification.type || 'info';
    };

    // Функция для перевода уведомлений
    const translateNotification = (notification: Notification) => {
        const { title, message } = notification;

        // Определяем тип уведомления по заголовку и переводим
        if (title.includes('Покупка кейсов') || title.toLowerCase().includes('case purchase')) {
            const match = message.match(/(\d+).+?(\d+)\s*(ChiCoins|ChiCoin)/i);
            if (match) {
                return {
                    title: t('notifications.notification_types.case_purchase'),
                    message: t('notifications.notification_types.case_purchase_message', {
                        count: match[1],
                        amount: match[2]
                    } as any)
                };
            }
        }

        if (title.includes('Повышение уровня') || title.toLowerCase().includes('level up')) {
            const levelMatch = message.match(/уровня (\d+)/);
            const bonusMatch = message.match(/\+(\d+\.?\d*)%/);
            if (levelMatch && bonusMatch) {
                return {
                    title: t('notifications.notification_types.level_up'),
                    message: t('notifications.notification_types.level_up_message', {
                        level: levelMatch[1],
                        bonus: bonusMatch[1]
                    })
                };
            }
        }

        // Поддержка китайских уведомлений о новых кейсах
        if (title.includes('Новый кейс получен') || title.toLowerCase().includes('new case received') ||
            title.includes('获得新箱子') || title.includes('新箱子')) {
            let caseName = '';

            // Для китайских уведомлений
            const chineseCaseMatch = message.match(/箱子：(.+?)(?:\s|$)/);
            if (chineseCaseMatch) {
                caseName = chineseCaseMatch[1].trim();
                // Переводим название кейса с китайского на текущий язык
                if (caseName.includes('每日箱子 - 状态')) {
                    caseName = 'Ежедневный кейс - Статус';
                } else if (caseName.includes('每日箱子 - 免费')) {
                    caseName = 'Ежедневный кейс - Бесплатный';
                } else if (caseName.includes('每日箱子 - 状态+')) {
                    caseName = 'Ежедневный кейс - Статус+';
                } else if (caseName.includes('每日箱子 - 状态++')) {
                    caseName = 'Ежедневный кейс - Статус++';
                } else if (caseName.includes('奖励箱子')) {
                    caseName = 'Бонусный кейс';
                }
            } else {
                // Для русских уведомлений
                const caseMatch = message.match(/кейс: (.+)$/);
                if (caseMatch) {
                    caseName = caseMatch[1];
                }
            }

            if (caseName) {
                return {
                    title: t('notifications.notification_types.new_case_received'),
                    message: t('notifications.notification_types.new_case_received_message', {
                        caseName: translateCaseName(caseName)
                    })
                };
            }
        }

        if (title.includes('Кейс открыт') || title.toLowerCase().includes('case opened')) {
            const itemMatch = message.match(/получили: (.+)$/);
            if (itemMatch) {
                return {
                    title: t('notifications.notification_types.case_opened'),
                    message: t('notifications.notification_types.case_opened_message', {
                        itemName: itemMatch[1]
                    })
                };
            }
        }

        // Поддержка уведомлений о выводе предметов
        if (title.includes('Запрос на вывод предмета') || title.toLowerCase().includes('item withdrawal')) {
            const itemMatch = message.match(/"(.+?)"/);
            if (itemMatch) {
                return {
                    title: t('notifications.notification_types.item_withdrawn'),
                    message: t('notifications.notification_types.item_withdrawn_message', {
                        itemName: itemMatch[1]
                    })
                };
            }
        }

        if (title.includes('Бонус') || title.toLowerCase().includes('bonus')) {
            const amountMatch = message.match(/(\d+)\s*(ChiCoins|ChiCoin)/i);
            if (amountMatch) {
                return {
                    title: t('notifications.notification_types.bonus_claimed'),
                    message: t('notifications.notification_types.bonus_claimed_message', {
                        amount: amountMatch[1]
                    })
                };
            }
        }

        if (title.includes('Достижение') || title.toLowerCase().includes('achievement')) {
            const achievementMatch = message.match(/достижение: (.+)$/);
            if (achievementMatch) {
                return {
                    title: t('notifications.notification_types.achievement_unlocked'),
                    message: t('notifications.notification_types.achievement_unlocked_message', {
                        achievementName: achievementMatch[1]
                    })
                };
            }
        }

        if (title.includes('Добро пожаловать') || title.toLowerCase().includes('welcome')) {
            return {
                title: t('notifications.notification_types.welcome'),
                message: t('notifications.notification_types.welcome_message')
            };
        }

        // Если не удалось определить тип, возвращаем оригинальный текст
        return { title, message };
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return t('notifications.just_now');
        if (diffInMinutes < 60) return t('notifications.minutes_ago', { minutes: diffInMinutes });
        if (diffInMinutes < 1440) return t('notifications.hours_ago', { hours: Math.floor(diffInMinutes / 60) });
        return t('notifications.days_ago', { days: Math.floor(diffInMinutes / 1440) });
    };

    const getNotificationIcon = (type: string) => {
        const iconClass = "text-lg";
        switch (type) {
            case 'success':
                return <FaCheckCircle className={`${iconClass} text-green-400`} />;
            case 'info':
                return <FaInfoCircle className={`${iconClass} text-blue-400`} />;
            case 'warning':
            case 'alert':
                return <FaExclamationTriangle className={`${iconClass} text-yellow-400`} />;
            case 'error':
                return <FaTimesCircle className={`${iconClass} text-red-400`} />;
            case 'system':
                return <FaCog className={`${iconClass} text-gray-400`} />;
            case 'friendRequest':
                return <FaUsers className={`${iconClass} text-purple-400`} />;
            case 'message':
                return <FaComments className={`${iconClass} text-indigo-400`} />;
            case 'caseOpen':
                return <FaBox className={`${iconClass} text-orange-400`} />;
            case 'bonus':
                return <FaGift className={`${iconClass} text-pink-400`} />;
            default:
                return <FaInfoCircle className={`${iconClass} text-blue-400`} />;
        }
    };

    const getNotificationTypeClass = (type: string) => {
        switch (type) {
            case 'success':
                return 'gaming-notification-success';
            case 'info':
                return 'gaming-notification-info';
            case 'warning':
            case 'alert':
                return 'gaming-notification-warning';
            case 'error':
                return 'gaming-notification-error';
            case 'bonus':
                return 'gaming-notification-bonus';
            case 'caseOpen':
                return 'gaming-notification-case';
            default:
                return 'gaming-notification-default';
        }
    };

    if (!openNotifications) return null;

    const notificationsElement = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[99999998]"
                onClick={handleCloseNotifications}
            />

            {/* Notifications Container */}
            <div
                ref={notificationsRef}
                className="gaming-notifications-container"
            >
                {/* Заголовок */}
                <div className="gaming-notifications-header">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <h3 className="gaming-notifications-title">{t('notifications.title')}</h3>
                            {unreadCount > 0 && (
                                <div className="gaming-unread-badge">
                                    <span className="gaming-unread-count">{unreadCount}</span>
                                    <div className="gaming-unread-pulse"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <LanguageSwitcher />
                            <button
                                onClick={handleCloseNotifications}
                                className="gaming-close-button"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>
                    </div>
                    {/* Кнопка "Прочитать все" в заголовке */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="gaming-mark-all-button"
                        >
                            {t('notifications.mark_all_notifications_read')}
                        </button>
                    )}
                </div>

                {/* Список уведомлений */}
                <div className="gaming-notifications-list">
                    {notifications.length === 0 ? (
                        <div className="gaming-empty-state">
                            <div className="gaming-empty-icon">
                                <FaGift className="text-4xl text-purple-400" />
                            </div>
                            <p className="gaming-empty-text">{t('notifications.no_new_notifications')}</p>
                            <p className="gaming-empty-subtext">{t('notifications.new_notifications_appear_here')}</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const translatedNotification = translateNotification(notification);
                            const detectedType = detectNotificationType(notification, translatedNotification);
                            return (
                                <div
                                    key={notification.id}
                                    className={`gaming-notification-item ${getNotificationTypeClass(detectedType)} ${
                                        !notification.is_read ? 'gaming-notification-unread' : 'gaming-notification-read'
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="gaming-notification-content">
                                        <div className="gaming-notification-icon">
                                            {getNotificationIcon(detectedType)}
                                        </div>
                                        <div className="gaming-notification-body">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`gaming-notification-title ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                                                    {translatedNotification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <div className="gaming-unread-indicator"></div>
                                                )}
                                            </div>
                                            <div className="gaming-notification-message">
                                                {String(translatedNotification.message).split('\n').map((line: string, index: number) => (
                                                    <p key={index}>{line}</p>
                                                ))}
                                            </div>
                                            <p className="gaming-notification-time">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="gaming-notifications-footer">
                    {notifications.length > 0 ? (
                        <div className="space-y-3">
                            <div className="gaming-footer-stats">
                                {t('notifications.showing_count_notifications', { count: notifications.length })}
                                {unreadCount > 0 && ` • ${unreadCount} ${t('notifications.unread')}`}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="gaming-footer-button"
                                >
                                    {t('notifications.mark_all_as_read')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="gaming-footer-empty">
                            {t('notifications.new_notifications_appear_here')}
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    // Рендерим уведомления в корне документа с помощью Portal
    return createPortal(notificationsElement, document.body);
};

export default Notifications;
