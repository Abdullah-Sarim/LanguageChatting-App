import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { Menu, BellIcon, LogOutIcon, ShipWheelIcon, Languages, BetweenVerticalStart } from "lucide-react";
import UserSearch from "./UserSearch";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useState } from "react";
import ConfirmModal from "../models/ConfirmModel";
import ProfileInsetModal from "../models/ProfileInsetModel";
import Sidebar from "./Sidebar";

const Navbar = ({ onMenuClick }) => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  //const { logoutMutation } = useLogout();


  
  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      {/* Hamburger Menu Button (md and below) */}
      <button
        className="my-3 sm:mx-3 btn btn-ghost btn-circle md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-8 w-8" />
      </button>

      <div className="container mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-2 w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="">
              <Link to="/" className="flex items-center gap-2">
                <BetweenVerticalStart className="size-7 md:size-10 text-primary" />
                <span className="hidden sm:block md:text-3xl sm:text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  V-LChat
                </span>
              </Link>
            </div>
            
          )}

          <UserSearch />

          <div className="flex items-center gap-3 sm:gap-5 sm:ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-7 w-7 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          {/* TODO */}
          <ThemeSelector />

          <div
            className="avatar cursor-pointer"
            onClick={() => setOpenProfile(true)}
          >
            <div className="w-13 rounded-full">
              <img src={authUser?.profilePic} alt={authUser.fullName} />
            </div>
          </div>

          <ProfileInsetModal
            isOpen={openProfile}
            onClose={() => setOpenProfile(false)}
          />

          {/* Logout button */}
          {/* <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button> */}

          <button
            className="hidden sm:block btn btn-ghost btn-circle"
            onClick={() => setOpen(true)}
          >
            <LogOutIcon className="h-8 w-8 text-base-content opacity-75" />
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
