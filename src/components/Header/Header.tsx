import { useState } from "react";
import Navbar from "./Navbar";
import { ImConnection } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

interface HeaderProps {
  onlineUsers?: number;
}

const Header: React.FC<HeaderProps> = ({ onlineUsers = 0 }) => {
  const [openNotifications, setOpenNotifications] = useState<boolean>(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);

  const navigate = useNavigate();
  const isHome = window.location.pathname === "/";

  const items = [
    {
      name: "ONLINE",
      icon: <ImConnection />,
      value: onlineUsers,
    },
  ];

  return (
    <div className="flex flex-col p-4 w-screen justify-center">
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
      <Navbar
        openNotifications={openNotifications}
        setOpenNotifications={setOpenNotifications}
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        onlineUsers={onlineUsers}
      />
      {!isHome && (
        <div className="p-4">
          <div className="flex items-center gap-2 text-[#84819a] cursor-pointer w-fit" onClick={() => navigate(-1)}>
            <BiArrowBack />
            <span>Back</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
