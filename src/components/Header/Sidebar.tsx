import { GiUpgrade } from "react-icons/gi";
import { MdOutlineSell } from "react-icons/md";
import { SlPlane } from "react-icons/sl";
import { FaHome, FaExchangeAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { TbCat } from "react-icons/tb";
import { BiWallet } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from "../../store/hooks";
import { useLogoutMutation } from "../../features/auth/authApi";
import { performFullLogout } from "../../utils/authUtils";
import Monetary from "../Monetary";

interface SidebarProps {
    closeSidebar: () => void;
    user?: any; // TODO: заменить на правильный тип
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar, user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            // Сначала вызываем API logout для уведомления сервера
            await logoutApi().unwrap();
        } catch (error) {
            // Даже если API недоступен, продолжаем logout
            console.log('Logout API error (continuing with logout):', error);
        } finally {
            // Выполняем полную очистку состояния приложения
            performFullLogout(dispatch);
            // Закрываем sidebar и перенаправляем
            closeSidebar();
            navigate('/');
        }
    };
    const links = [
        {
            name: t('header.home'),
            path: "/",
            icon: <FaHome className="text-2xl" />,
        },
        {
            name: t('header.exchange'),
            path: "/exchange",
            icon: <FaExchangeAlt className="text-2xl" />,
        },
        {
            name: t('header.marketplace'),
            path: "/marketplace",
            icon: <MdOutlineSell className="text-2xl" />,
        },
        {
            name: t('header.coin_flip'),
            path: "/leaderboard",
            icon: <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6" />,
        },
        {
            name: t('header.crash'),
            path: "/crash",
            icon: <SlPlane className="text-2xl" />,
        },
        {
            name: t('header.upgrade'),
            path: "/upgrade",
            icon: <GiUpgrade className="text-2xl" />,
        },
        {
            name: t('header.slots'),
            path: "/slot",
            icon: <TbCat className="text-2xl" />,
        }
    ];

    return (
        <div className="sidebar-overlay" onClick={closeSidebar}>
            <div
                className="sidebar-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Заголовок */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <img
                                src="/images/logo.webp"
                                alt="logo"
                                className="w-12 h-12 object-contain" // !TODO
                              //   onError={(e) => {
                              //       e.currentTarget.src = '/favicon.ico';
                              //   }}
                            />
                            <div className="font-normal text-xl text-white">
                                ChiBox
                            </div>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Баланс пользователя */}
                    {user && (
                        <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center space-x-2 text-green-400 mb-3">
                                <BiWallet className="text-lg" />
                                <span className="text-sm">{t('header.balance')}:</span>
                                <Monetary value={user?.balance ?? 0} />
                            </div>

                            {/* Информация о пользователе */}
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.profilePicture || '/images/default-avatar.png'}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full" // TODO изменить favicon везде
                                    // onError={(e) => {
                                    //     e.currentTarget.src = '/favicon.ico';
                                    // }}
                                />
                                <div>
                                    <p className="text-white font-medium">{user.username}</p>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Навигационные ссылки */}
                    <div className="flex-1 p-4">
                        <div className="space-y-2">
                            {links.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    onClick={closeSidebar}
                                    className="sidebar-item"
                                >
                                    {link.icon}
                                    <span className="text-lg">{link.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Нижние кнопки */}
                    <div className="p-4 border-t border-gray-700">
                        {user ? (
                            <div className="space-y-2">
                                <Link
                                    to="/profile"
                                    onClick={closeSidebar}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center block"
                                >
                                    {t('header.profile')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoggingOut ? t('header.signing_out') : t('header.sign_out')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    to="/login"
                                    onClick={closeSidebar}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center block"
                                >
                                    {t('header.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={closeSidebar}
                                    className="w-full bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded-lg transition-colors text-center block"
                                >
                                    {t('header.register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
