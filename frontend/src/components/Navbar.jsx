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


  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      {/* Hamburger Menu Button */}
      {showHamburger && (
        <button
          className="my-3 sm:mx-3 btn btn-ghost btn-circle"
          onClick={onMenuClick}
        >
          <Menu className="h-8 w-8" />
        </button>
      )}

      <div className="container mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-2 w-full">

          <UserSearch />

          <div className="flex items-center gap-3 sm:gap-5 sm:ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-8 w-8 text-base-content opacity-80" />
              </button>
            </Link>
          </div>

          {/* TODO */}
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
            <LogOutIcon className="h-9 w-9 text-base-content opacity-75" />
          </button>

          {/* ////////////////////// */}
          <ConfirmModal
            isOpen={open}
            title="Confirm Logout"
            message="Are you sure you want to log out?"
            onCancel={() => setOpen(false)}
            onConfirm={logoutMutation}
          />
          {/* //////////////////// */}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
