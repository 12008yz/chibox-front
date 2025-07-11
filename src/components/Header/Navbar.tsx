import { Link, useNavigate } from "react-router-dom";
import MainButton from "../MainButton";
import { MdOutlineSell } from "react-icons/md";
import { BsCoin } from "react-icons/bs";
import { SlPlane } from "react-icons/sl";
import { GiUpgrade } from 'react-icons/gi';
import { TbCat } from "react-icons/tb";
import { FaBars } from 'react-icons/fa';
import RightContent from "./RightContent";
import { useIsAuthenticated } from '../../store/hooks';

interface NavbarProps {
  openNotifications?: boolean;
  setOpenNotifications?: (open: boolean) => void;
  openSidebar?: boolean;
  setOpenSidebar?: (open: boolean) => void;
  onlineUsers?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  openSidebar,
  setOpenSidebar,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    if (setOpenSidebar) {
      setOpenSidebar(!openSidebar);
    }
  };

  const handleAuthClick = () => {
    navigate('/login');
  };

  return (
    <div className="w-full flex justify-center">
      <nav className="py-4 px-8 bg-[#19172D] w-[calc(100vw-2rem)] max-w-[1920px] flex justify-center notched">
        <div className="flex items-center justify-between w-full">
          <div className="md:hidden">
            <FaBars onClick={toggleSidebar} className="text-2xl cursor-pointer" />
          </div>
          <div className="hidden md:flex">
            <Link to="/">
              <div className="flex items-center gap-2">
                <img src="/images/logo.webp" alt="logo" className="w-12 h-12 object-contain" />
                <div className="flex flex-col justify-center">
                  <div className="font-normal text-xl text-white">ChiBox</div>
                </div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6 ml-8 overflow-hidden">
              <Link to="/marketplace" className="flex items-center gap-2 font-normal text-xs 2xl:text-lg cursor-pointer">
                <MdOutlineSell className="text-2xl" />
                <span className="text-white hover:text-gray-200 transition-all">Market</span>
              </Link>
              <Link to="/coinflip" className="flex items-center gap-2 font-normal text-xs 2xl:text-lg cursor-pointer">
                <BsCoin className="text-2xl" />
                <span className="text-white hover:text-gray-200 transition-all">Coin Flip</span>
              </Link>
              <Link to="/crash" className="flex items-center gap-2 font-normal text-xs 2xl:text-lg cursor-pointer">
                <SlPlane className="text-2xl" />
                <span className="text-white hover:text-gray-200 transition-all">Crash</span>
              </Link>
              <Link to="/upgrade" className="flex items-center gap-2 font-normal text-xs 2xl:text-lg cursor-pointer">
                <GiUpgrade className="text-2xl" />
                <span className="text-white hover:text-gray-200 transition-all">Upgrade</span>
              </Link>
              <Link to="/slot" className="flex items-center gap-2 font-normal text-xs 2xl:text-lg cursor-pointer">
                <TbCat className="text-2xl" />
                <span className="text-white hover:text-gray-200 transition-all">Slots</span>
              </Link>
            </div>
          </div>
          { isAuthenticated ? (
            <RightContent />
          ):(
            <div className="flex items-center gap-4">
              <MainButton text="Sign In" onClick={handleAuthClick} />
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
