import React, { useState, useEffect, memo } from "react";
import Navbar from "./Navbar";
import CaseOpenedNotification from "./CaseOpenedNotification";

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

const HeaderComponent: React.FC<HeaderProps> = ({
  onlineUsers = 0,
  recentCaseOpenings = [],
  notification,
  setNotification,
  user
}) => {
  const [openNotifications, setOpenNotifications] = useState<boolean>(false);
  const [caseNotifications, setCaseNotifications] = useState<CaseOpeningItem[]>([]);

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
    }
  }, [notification]);

  const handleCloseCaseNotification = (index: number) => {
    setCaseNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Navbar вынесен как независимый компонент */}
      <Navbar
        openNotifications={openNotifications}
        setOpenNotifications={setOpenNotifications}
        user={user}
        onlineUsers={onlineUsers}
      />

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
    </>
  );
};

const Header = memo(HeaderComponent);
export default Header;
