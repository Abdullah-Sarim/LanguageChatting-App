import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
    fixed md:sticky top-0 left-0 md:z-30 z-100
    h-screen
    w-64 lg:w-75
    bg-base-200 border-r border-base-300
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    flex flex-col
  `}
      >
        <div className="p-5 border-b border-base-300">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <ShipWheelIcon className="lg:size-10 size-8 text-primary" />
            <span className="lg:text-3xl text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              LangChat
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            onClick={onClose}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/" ? "btn-active" : ""
            }`}
          >
            <HomeIcon className="size-5 opacity-70" />
            <span>Home</span>
          </Link>

          <Link
            to="/friends"
            onClick={onClose}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/friends" ? "btn-active" : ""
            }`}
          >
            <UsersIcon className="size-5 opacity-70" />
            <span>Friends</span>
          </Link>

          <Link
            to="/notifications"
            onClick={onClose}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/notifications" ? "btn-active" : ""
            }`}
          >
            <BellIcon className="size-5 opacity-70" />
            <span>Notifications</span>
          </Link>
        </nav>

        {/* USER PROFILE SECTION */}
        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-15 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold lg:text-[19px] text-[17px]">
                {authUser?.fullName}
              </p>
              <p className="text-ms text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
