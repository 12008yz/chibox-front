import { useEffect, useRef } from 'react';
import { useGetUserNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from '../../../features/user/userApi';
import type { Notification } from '../../../types/api';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaCog, FaUsers, FaComments, FaGift, FaBox, FaTimes } from 'react-icons/fa';

interface NotificationsProps {
    openNotifications: boolean;
    setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notifications: React.FC<NotificationsProps> = ({ openNotifications, setOpenNotifications }) => {
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Получаем уведомления из API
    const {
        data: notificationsData,
        refetch: refetchNotifications
    } = useGetUserNotificationsQuery({ limit: 20 }, {
        refetchOnMountOrArgChange: true,
        pollingInterval: openNotifications ? 10000 : 0,
    });

    // Мутации для работы с уведомлениями
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

    const notifications = notificationsData?.data?.items || [];

    // Подсчитаем непрочитанные уведомления
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleCloseNotifications = () => {
        setOpenNotifications(false);
    };

    // Отметить уведомление как прочитанное
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId).unwrap();
            refetchNotifications();
        } catch (error) {
            console.error('Ошибка при отметке уведомления как прочитанного:', error);
        }
    };

    // Отметить все уведомления как прочитанные
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
            refetchNotifications();
        } catch (error) {
            console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
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
    }, [openNotifications]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Сейчас';
        if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
        return `${Math.floor(diffInMinutes / 1440)} дн назад`;
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

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999998]"
                onClick={handleCloseNotifications}
            />

            {/* Notifications Container */}
            <div
                ref={notificationsRef}
                className="gaming-notifications-container"
                style={{ zIndex: 9999999 }}
            >
                {/* Заголовок */}
                <div className="gaming-notifications-header">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <h3 className="gaming-notifications-title">Уведомления</h3>
                            {unreadCount > 0 && (
                                <div className="gaming-unread-badge">
                                    <span className="gaming-unread-count">{unreadCount}</span>
                                    <div className="gaming-unread-pulse"></div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleCloseNotifications}
                            className="gaming-close-button"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </div>
                    {/* Кнопка "Прочитать все" в заголовке */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="gaming-mark-all-button"
                        >
                            Прочитать все уведомления
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
                            <p className="gaming-empty-text">Нет новых уведомлений</p>
                            <p className="gaming-empty-subtext">Новые уведомления появятся здесь</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`gaming-notification-item ${getNotificationTypeClass(notification.type)} ${
                                    !notification.is_read ? 'gaming-notification-unread' : 'gaming-notification-read'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="gaming-notification-content">
                                    <div className="gaming-notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="gaming-notification-body">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`gaming-notification-title ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <div className="gaming-unread-indicator"></div>
                                            )}
                                        </div>
                                        <div className="gaming-notification-message">
                                            {notification.message.split('\n').map((line, index) => (
                                                <p key={index}>{line}</p>
                                            ))}
                                        </div>
                                        <p className="gaming-notification-time">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="gaming-notifications-footer">
                    {notifications.length > 0 ? (
                        <div className="space-y-3">
                            <div className="gaming-footer-stats">
                                Показано {notifications.length} уведомлений
                                {unreadCount > 0 && ` • ${unreadCount} непрочитанных`}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="gaming-footer-button"
                                >
                                    Отметить все как прочитанные
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="gaming-footer-empty">
                            Новые уведомления появятся здесь
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Notifications;
