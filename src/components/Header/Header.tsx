import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CaseOpenedNotification from "./CaseOpenedNotification";
import { ImConnection } from "react-icons/im";

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
  avatar_url?: string;
  steam_avatar_url?: string;
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
  user?: any;
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
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

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
      console.log('Notification:', notification.message);
    }
  }, [notification]);

  // Отслеживание скролла для скрытия/показа хедера
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        // В самом верху страницы - всегда показываем хедер
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Скролл вниз и не в начале - скрываем хедер
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Скролл вверх - показываем хедер
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleCloseCaseNotification = (index: number) => {
    setCaseNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`modern-header relative z-[99] w-full transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ background: 'transparent' }}
    >
      {/* Header Content */}
      <div className="relative flex flex-col w-full" style={{ background: 'transparent' }}>
        {/* Online Users Status Bar */}
        <div className="flex items-center justify-start px-4 py-1" style={{ background: 'transparent' }}>
          <div className="status-indicator flex items-center gap-1.5 px-3 py-1.5 rounded-full">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 text-cyan-400 text-xs font-medium"
              >
                <div className="status-icon relative text-sm">
                  {item.icon}
                  <div className="status-pulse"></div>
                </div>
                <div className="font-bold text-sm gaming-font">{item.value || 0}</div>
                <div className="text-cyan-300/70 text-xs">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="w-full px-4 pb-4 overflow-visible" style={{ background: 'transparent' }}>
          <Navbar
            openNotifications={openNotifications}
            setOpenNotifications={setOpenNotifications}
            openSidebar={openSidebar}
            setOpenSidebar={setOpenSidebar}
            user={user}
          />
        </div>
      </div>

      {/* Sidebar */}
      {openSidebar && (
        <Sidebar
          closeSidebar={() => setOpenSidebar(false)}
          user={user}
        />
      )}

      {/* Case Notifications */}
      {caseNotifications.map((caseOpening, index) => (
        <CaseOpenedNotification
          key={`${caseOpening.timestamp}-${index}`}
          user={caseOpening.user}
          item={caseOpening.winningItems[0]}
          caseImage={caseOpening.caseImage}
          onClose={() => handleCloseCaseNotification(index)}
        />
      ))}
    </div>
  );
};

export default Header;
