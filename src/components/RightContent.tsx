import React, { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { FaRegBell, FaRegBellSlash } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { BiWallet } from "react-icons/bi";
import Monetary from "./Monetary";
import { useAppDispatch, useCurrentUser, useIsAuthenticated } from '../store/hooks';
import { logout } from "../features/auth/authSlice";

const RightContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useIsAuthenticated();
    const user = useCurrentUser();

    // Состояния для уведомлений
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);

    // Обработка выхода
    const handleLogout = () => {
        dispatch(logout());
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="flex items-center gap-4">
            {/* Баланс */}
            <div className="flex items-center gap-2 text-green-400 font-normal text-lg hover:text-green-300 transition-all">
                <BiWallet className="text-2xl hidden md:block" />
                <div className="max-w-[80px] md:max-w-[140px] overflow-hidden text-sm md:text-lg truncate">
                    <Monetary value={Math.floor(user.balance)} />
                </div>
            </div>

            {/* Уведомления */}
            <div className="relative cursor-pointer" onClick={() => setOpenNotifications(!openNotifications)}>
                <FaRegBell style={{ fontSize: "20px" }} />
                {hasUnreadNotifications && !openNotifications && (
                    <div className="absolute -top-1 -right-[2px] w-3 h-3 bg-red-500 rounded-full" />
                )}
            </div>

            {/* Профиль пользователя */}
            <div className="flex items-center gap-2">
                <div>
                    <Avatar
                        image={user.steam_avatar}
                        loading={false}
                        id={user.id}
                        size="medium"
                        level={user.level}
                        showLevel={true}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.username}</span>
                </div>
            </div>

            {/* Выход */}
            <div
                className="text-[#625F7E] font-normal text-lg cursor-pointer hover:text-gray-200 transition-all"
                onClick={handleLogout}
            >
                <IoMdExit className="text-2xl" />
            </div>
        </div>
    );
};

export default RightContent;
