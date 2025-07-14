import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CaseOpenedNotification from "./CaseOpenedNotification";
import { ImConnection } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

interface BasicItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  price: number;
}

interface User {
  id: number;
  name: string;
  profilePicture: string;
}

interface CaseOpeningItem {
  caseImage: string;
  timestamp: number;
  user: User;
  winningItems: BasicItem[];
}

interface HeaderProps {
  onlineUsers?: number;
  recentCaseOpenings?: CaseOpeningItem[];
  notification?: any;
  setNotification?: React.Dispatch<React.SetStateAction<any>>;
  user?: any; // TODO: заменить на правильный тип пользователя
}

const Header: React.FC<HeaderProps> = ({
  onlineUsers = 0,
  recentCaseOpenings = [],
  notification,
  setNotification,
  user
}) => {
  const [openNotifications, setOpenNotifications] = useState<boolean>(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [caseNotifications, setCaseNotifications] = useState<CaseOpeningItem[]>([]);

  const navigate = useNavigate();
  const isHome = window.location.pathname === "/";

  const items = [
    {
      name: "ONLINE",
      icon: <ImConnection />,
      value: onlineUsers,
    },
  ];

  // Обработка уведомлений
  useEffect(() => {
    if (openNotifications === true && setNotification) {
      setNotification([]);
    }
  }, [openNotifications, setNotification]);

  // Обработка уведомлений о вскрытых кейсах
  useEffect(() => {
    if (recentCaseOpenings.length > 0) {
      const latestOpening = recentCaseOpenings[recentCaseOpenings.length - 1];
      if (latestOpening && latestOpening.winningItems.length > 0) {
        setCaseNotifications(prev => [...prev, latestOpening]);
      }
    }
  }, [recentCaseOpenings]);

  // Тост уведомления
  useEffect(() => {
    if (notification?.message) {
      // TODO: Implement toast notification
      console.log('Notification:', notification.message);
    }
  }, [notification]);

  const handleCloseCaseNotification = (index: number) => {
    setCaseNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col p-4 w-screen justify-center header-gradient relative z-[999999]">
      {/* Онлайн счетчик */}
      <div className="flex pb-2 items-center">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-green-400 text-sm font-normal"
          >
            {item.icon}
            <div className="font-bold">{item.value || 0}</div>
            <div className="text-[#84819a] text-sm">{item.name}</div>
          </div>
        ))}
      </div>

      {/* Навигационная панель */}
      <Navbar
        openNotifications={openNotifications}
        setOpenNotifications={setOpenNotifications}
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        user={user}
      />

      {/* Кнопка "Назад" для неглавных страниц */}
      {!isHome && (
        <div className="p-4">
          <div
            className="flex items-center gap-2 text-[#84819a] cursor-pointer w-fit hover:text-white transition-colors"
            onClick={() => navigate(-1)}
          >
            <BiArrowBack />
            <span>Назад</span>
          </div>
        </div>
      )}

      {/* Боковое меню */}
      {openSidebar && (
        <Sidebar
          closeSidebar={() => setOpenSidebar(false)}
          user={user}
        />
      )}

      {/* Уведомления о вскрытых кейсах */}
      {caseNotifications.map((caseOpening, index) => (
        <CaseOpenedNotification
          key={`${caseOpening.timestamp}-${index}`}
          user={caseOpening.user}
          item={caseOpening.winningItems[0]} // Показываем первый выигранный предмет
          caseImage={caseOpening.caseImage}
          onClose={() => handleCloseCaseNotification(index)}
        />
      ))}
    </div>
  );
};

export default Header;
