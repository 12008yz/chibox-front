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

  const handleCloseCaseNotification = (index: number) => {
    setCaseNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="modern-header relative z-[99]">
      {/* Animated Background Glow */}
      <div className="header-glow absolute inset-0 opacity-30 pointer-events-none"></div>

      {/* Header Content */}
      <div className="relative flex flex-col p-4 w-screen justify-center">
        {/* Online Users Status Bar */}
        <div className="flex pb-3 items-center justify-center">
          <div className="status-indicator flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md bg-black/20 border border-cyan-500/30">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-cyan-400 text-sm font-medium"
              >
                <div className="status-icon relative">
                  {item.icon}
                  <div className="status-pulse"></div>
                </div>
                <div className="font-bold text-lg gaming-font">{item.value || 0}</div>
                <div className="text-cyan-300/70 text-sm">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <Navbar
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
          openSidebar={openSidebar}
          setOpenSidebar={setOpenSidebar}
          user={user}
        />
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
