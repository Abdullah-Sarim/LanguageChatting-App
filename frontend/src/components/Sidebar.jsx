import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { useState, useEffect } from "react";
import ConfirmModal from "../models/ConfirmModel";
import { LogOutIcon } from "lucide-react";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UsersIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useStreamChat } from "../context/StreamChatContext.jsx";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Sidebar = ({ isOpen, onClose, hideByDefault = false }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation } = useLogout();
  const [open, setOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 768);
  const currentPath = location.pathname;

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldShow = isOpen || (!hideByDefault && isLargeScreen);
  const isOverlay = hideByDefault || !isLargeScreen;
  const isAlwaysVisible = !hideByDefault && isLargeScreen;

  const streamChat = useStreamChat();
  const client = streamChat?.client;
  const userId = authUser?.id || authUser?._id;
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!client || !userId) return;
    let interval;
    const fetchUnreadCount = async () => {
      if (!client || !userId) return;
      try {
        const channels = await client.queryChannels({
          type: "messaging",
          members: { $in: [userId] },
        });
        const total = channels.reduce((sum, ch) => sum + ch.countUnread(), 0);
        setTotalUnread(total);
      } catch {}
    };
    fetchUnreadCount();
    interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [client, userId]);

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    refetchInterval: 30000,
    enabled: !!authUser,
  });

  const notificationCount = friendRequests?.incomingReqs?.length || 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && isOverlay && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`
    ${isOverlay ? "fixed" : "sticky"} top-0 left-0 z-40
    h-screen
    w-64 lg:w-75
    bg-base-200 border-r border-base-300
    transform transition-transform duration-300
    ${isAlwaysVisible ? "" : isOpen ? "translate-x-0" : "-translate-x-full"}
    flex flex-col
  `}
      >
        <div className="p-3.5 border-b border-base-300">
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
            className={`btn btn-ghost justify-start w-full gap-5 px-3 normal-case ${
              currentPath === "/" ? "btn-active" : ""
            }`}
          >
            <HomeIcon className="size-5 opacity-70" />
            <span className="flex-">Home</span>
          </Link>

          <Link
            to="/friends"
            onClick={onClose}
            className={`btn btn-ghost justify-start w-full gap-5 px-3 normal-case ${
              currentPath === "/friends" ? "btn-active" : ""
            }`}
          >
            <UsersIcon className="size-5 opacity-70" />
            <span className="flex-">Friends</span>
          </Link>


          {/* Messages button added below Friends and above Notifications */}
          <Link
            to="/messages"
            onClick={onClose}
            className={`btn btn-ghost justify-start w-full gap-5 px-3 normal-case ${
              currentPath === "/messages" ? "btn-active" : ""
            }`}
          >
            <MessageSquareIcon className="size-5 opacity-70" />
            <span className="flex-">Messages</span>
            {totalUnread > 0 && (
              <span className="badge badge-error badge-xs">{totalUnread}</span>
            )}
          </Link>
          <Link
            to="/notifications"
            onClick={onClose}
            className={`btn btn-ghost justify-start w-full gap-5 px-3 normal-case ${
              currentPath === "/notifications" ? "btn-active" : ""
            }`}
          >
            <BellIcon className="size-5 opacity-70" />
            <span className="flex-">Notifications</span>
            {notificationCount > 0 && (
              <span className="badge badge-error badge-xs">{notificationCount}</span>
            )}
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
            <button
            className="block sm:hidden btn btn-ghost btn-circle"
            onClick={() => setOpen(true)}
          >
            <LogOutIcon className="h-8 w-8 text-base-content opacity-75" />
          </button>
          </div>
        </div>
      </aside>
      <ConfirmModal
            isOpen={open}
            title="Confirm Logout"
            message="Are you sure you want to log out?"
            onCancel={() => setOpen(false)}
            onConfirm={logoutMutation}
          />
    </>
  );
};
export default Sidebar;
