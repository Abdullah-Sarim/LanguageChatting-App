import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { Menu, BellIcon, LogOutIcon, ShipWheelIcon, Languages } from "lucide-react";
import UserSearch from "./UserSearch";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useState, useEffect } from "react";
import ConfirmModal from "../models/ConfirmModel";
import ProfileInsetModal from "../models/ProfileInsetModel";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Navbar = ({ onMenuClick, hideSidebar = false }) => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const location = useLocation();
  const isMessagesPage = location.pathname === "/messages";
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const showHamburger = isSmallScreen || isMessagesPage || hideSidebar;

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    refetchInterval: 30000,
    enabled: !!authUser,
  });

  const unreadCount = friendRequests?.incomingReqs?.length || 0;


  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-15 md:h-17 flex items-center px-2">
      {/* Left side - Hamburger or placeholder to keep alignment */}
      <div className="w-12 sm:w-14 flex-shrink-0">
        {showHamburger && (
          <button
            className="btn btn-ghost btn-circle"
            onClick={onMenuClick}
          >
            <Menu className="h-7 w-7" />
          </button>
        )}
      </div>

      {/* Right side - All icons */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <UserSearch />

        <Link to={"/notifications"} className="relative">
          <button className="btn btn-ghost btn-circle">
            <BellIcon className="h-7 w-7 text-base-content opacity-80" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 badge badge-error badge-xs">
              {unreadCount}
            </span>
          )}
        </Link>

        <ThemeSelector />

        <div
          className="avatar cursor-pointer"
          onClick={() => setOpenProfile(true)}
        >
          <div className="w-10 rounded-full">
            <img src={authUser?.profilePic} alt={authUser.fullName} />
          </div>
        </div>

        <ProfileInsetModal
          isOpen={openProfile}
          onClose={() => setOpenProfile(false)}
        />

        <button
          className="hidden sm:block btn btn-ghost btn-circle"
          onClick={() => setOpen(true)}
        >
          <LogOutIcon className="h-8 w-8 text-base-content opacity-75" />
        </button>

        <ConfirmModal
          isOpen={open}
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          onCancel={() => setOpen(false)}
          onConfirm={logoutMutation}
        />
      </div>
    </nav>
  );
};
export default Navbar;
