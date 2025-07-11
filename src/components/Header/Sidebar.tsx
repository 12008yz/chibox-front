import { BsCoin } from "react-icons/bs";
import { GiUpgrade } from "react-icons/gi";
import { MdOutlineSell } from "react-icons/md";
import { SlPlane } from "react-icons/sl";
import { FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";
import { TbCat } from "react-icons/tb";
import { BiWallet } from "react-icons/bi";
import Monetary from "../Monetary";

interface SidebarProps {
    closeSidebar: () => void;
    user?: any; // TODO: заменить на правильный тип
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar, user }) => {
    const links = [
        {
            name: "Home",
            path: "/",
            icon: <FaHome className="text-2xl" />,
        },
        {
            name: "Market",
            path: "/marketplace",
            icon: <MdOutlineSell className="text-2xl" />,
        },
        {
            name: "Coin Flip",
            path: "/coinflip",
            icon: <BsCoin className="text-2xl" />,
        },
        {
            name: "Crash",
            path: "/crash",
            icon: <SlPlane className="text-2xl" />,
        },
        {
            name: "Upgrade",
            path: "/upgrade",
            icon: <GiUpgrade className="text-2xl" />,
        },
        {
            name: "Slots",
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
                                <span className="text-sm">Баланс:</span>
                                <Monetary value={user?.walletBalance ?? 0} />
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
                                    Профиль
                                </Link>
                                <button
                                    onClick={() => {
                                        // TODO: Implement logout
                                        console.log('Logout');
                                        closeSidebar();
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    to="/login"
                                    onClick={closeSidebar}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center block"
                                >
                                    Войти
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={closeSidebar}
                                    className="w-full bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded-lg transition-colors text-center block"
                                >
                                    Регистрация
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
