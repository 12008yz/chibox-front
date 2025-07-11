import { useEffect, useRef } from 'react';

interface NotificationsProps {
    openNotifications: boolean;
    setOpenNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Notification {
    id: string;
    content: string;
    createdAt: string;
    read: boolean;
    title: string;
    type: 'friendRequest' | 'message' | 'alert' | 'caseOpen' | 'bonus';
}

const Notifications: React.FC<NotificationsProps> = ({ openNotifications, setOpenNotifications }) => {
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Моковые данные уведомлений (позже заменить на реальные)
    const notifications: Notification[] = [
        {
            id: '1',
            title: 'Добро пожаловать!',
            content: 'Спасибо за регистрацию в ChiBox Casino',
            createdAt: new Date().toISOString(),
            read: false,
            type: 'message'
        },
        {
            id: '2',
            title: 'Бонус доступен',
            content: 'Ваш ежедневный бонус готов к получению',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            type: 'bonus'
        }
    ];

    const handleCloseNotifications = () => {
        setOpenNotifications(false);
    };

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                handleCloseNotifications();
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
        switch (type) {
            case 'friendRequest':
                return '👥';
            case 'message':
                return '💬';
            case 'alert':
                return '⚠️';
            case 'caseOpen':
                return '📦';
            case 'bonus':
                return '🎁';
            default:
                return '🔔';
        }
    };

    if (!openNotifications) return null;

    return (
        <div
            ref={notificationsRef}
            className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
        >
            {/* Заголовок */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Уведомления</h3>
                    <button
                        onClick={handleCloseNotifications}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Список уведомлений */}
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                        <div className="text-4xl mb-2">🔔</div>
                        <p>Нет новых уведомлений</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-blue-900/20' : ''
                            }`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                            {notification.title}
                                        </h4>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                        {notification.content}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formatTime(notification.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Футер */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-700">
                    <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Отметить все как прочитанные
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notifications;
