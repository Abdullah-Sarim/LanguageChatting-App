import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Channel,
  Window,
  MessageList,
  MessageInput,
  TypingIndicator,
  ChannelHeader,
  Thread,
} from "stream-chat-react";
import { useStreamChat } from "../context/StreamChatContext.jsx";
import useAuthUser from "../hooks/useAuthUser.js";
import { VideoIcon } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useNavigate, useSearchParams } from "react-router";

const MessagesPage = () => {
  const { client } = useStreamChat();
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = authUser?.id || authUser?._id;

  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [channel, setChannel] = useState(null);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState({});
  const [text, setText] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  //Load last chat from localStorage or from URL
  useEffect(() => {
    const friendId = searchParams.get("friendId");
    if (friendId) {
      const fetchFriendAndOpen = async () => {
        try {
          const res = await axiosInstance.get(`/users/friends`);
          const friend = res.data.friends.find(f => f._id === friendId);
          if (friend) {
            setSelectedFriend(friend);
            openChat(friend);
          }
        } catch {}
      };
      fetchFriendAndOpen();
    } else {
      const last = localStorage.getItem("lastChatFriend");
      if (last) {
        try {
          setSelectedFriend(JSON.parse(last));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowChatOnMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      if (!client || !userId) return;
      
      try {
        const res = await axiosInstance.get("/users/friends");
        const list = res?.data?.friends || [];
        setFriends(list);

        // Fetch unread counts from all channels
        const channels = await client.queryChannels({
          type: "messaging",
          members: { $in: [userId] },
        });

        const unreadCounts = {};
        channels.forEach((ch) => {
          const otherMember = Object.values(ch.state.members).find(
            (m) => m.user.id !== userId
          );
          if (otherMember) {
            unreadCounts[otherMember.user.id] = ch.countUnread();
          }
        });
        setUnread(unreadCounts);

        const friendId = searchParams.get("friendId");
        const targetFriend = friendId 
          ? list.find(f => f._id === friendId) 
          : null;

        if (targetFriend) {
          setSelectedFriend(targetFriend);
          openChat(targetFriend);
        } else if (!selectedFriend && list.length > 0) {
          const last = localStorage.getItem("lastChatFriend");
          const parsed = last ? JSON.parse(last) : list[0];
          openChat(parsed);
        }
      } catch {
        setFriends([]);
      }
    };

    fetchFriends();
  }, [client, userId, searchParams]);

  //Open chat
  const openChat = async (friend) => {
    if (!client || !userId || !friend) return;

    const channelId = [userId, friend._id].sort().join("-");

    const dm = client.channel("messaging", channelId, {
      members: [userId, friend._id],
      name: friend.fullName,
    });

    await dm.watch();

    const unreadCount = dm.countUnread();

    // Mark messages as read
    if (unreadCount > 0) {
      await dm.markRead();
    }

    setSelectedFriend(friend);
    setChannel(dm);
    setUnread((u) => ({ ...u, [friend._id]: 0 }));

    //Save last chat
    localStorage.setItem("lastChatFriend", JSON.stringify(friend));

    //Close mobile sidebar
    setMobileLeftOpen(false);

    //Show chat on mobile
    setShowChatOnMobile(true);
  };

  const goBackToContacts = () => {
    setShowChatOnMobile(false);
    setSelectedFriend(null);
    setChannel(null);
  };

  //Message listener
  useEffect(() => {
    if (!client || !userId) return;

    const onMessage = (evt) => {
      const text = evt?.message?.text;
      if (!text) return;

      toast.success(
        `New message: ${
          text.length > 40 ? text.slice(0, 40) + "..." : text
        }`
      );

      try {
        const members = Object.values(
          evt?.channel?.state?.members || {}
        );

        const friendId =
          members.find((m) => m?.user?.id !== userId)?.user?.id;

        if (evt?.channel?.cid !== channel?.cid) {
          setUnread((u) => ({
            ...u,
            [friendId]: (u[friendId] ?? 0) + 1,
          }));
        }
      } catch {}
    };

    client.on("message.new", onMessage);
    return () => client.off("message.new", onMessage);
  }, [client, userId, channel]);

  //Send
  const sendMessage = async () => {
    if (!channel || !text.trim()) return;
    await channel.sendMessage({ text: text.trim() });
    setText("");
  };

  //Filter
  const filteredFriends = friends.filter((f) =>
    (f.fullName || "").toLowerCase().includes(query.toLowerCase())
  );

  const unreadForFriend = (f) => unread[f._id] ?? 0;

  const getFriendStatus = (friend) => {
    const streamUser = client?.state?.users?.[friend._id];
    const isOnline = streamUser?.online;
    const lastActive = streamUser?.last_active;

    if (isOnline) return { status: "online", text: "Online" };

    if (!lastActive) return { status: "offline", text: "Offline" };

    const diff = Date.now() - new Date(lastActive).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return { status: "offline", text: "Last seen just now" };
    if (minutes < 60) return { status: "offline", text: `Last seen ${minutes}m ago` };

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return { status: "offline", text: `Last seen ${hours}h ago` };

    return { status: "offline", text: "Last seen yesterday" };
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-base-100 flex justify-center overflow-hidden">
  <div className="relative w-full h-full flex bg-base-100 overflow-hidden">

    {/* CONTACTS LIST - Show on desktop OR when chat not open on mobile */}
    <aside
  className={`${showChatOnMobile ? "hidden" : "flex"} md:flex md:w-[250px] lg:w-[320px] border-r border-base-300 flex-col w-full h-full overflow-hidden bg-base-100`}
>

  {/*STICKY SEARCH */}
  <div className="p-3 border-b border-base-300 sticky top-0 bg-base-100 z-20">
    <input
      placeholder="Search Messages"
      className="input input-bordered w-full rounded-2xl"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  </div>

  {/*SCROLLABLE FRIEND LIST */}
  <div className="flex-1 overflow-y-auto py-2 px-2.5">
    {filteredFriends.map((f) => {
      const { status, text: statusText } = getFriendStatus(f);
      const isOnline = status === "online";

      return (
      <div
        key={f._id}
        onClick={() => openChat(f)}
        className={`flex items-center gap-4 p-3 cursor-pointer transition ${
          selectedFriend?._id === f._id
            ? "bg-base-200 rounded-2xl"
            : "hover:bg-base-200 rounded-2xl"
        }`}
      >
        <div className="relative">
          <img
            src={f.profilePic}
            className="w-12 h-11 rounded-full object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-100 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium">{f.fullName}</div>
          <div className={`text-xs ${isOnline ? "text-green-500" : "text-base-content/50"}`}>
            {statusText}
          </div>
        </div>

        {unreadForFriend(f) > 0 && (
          <span className="badge badge-success badge-xs">
            {unreadForFriend(f)}
          </span>
        )}
      </div>
      );
    })}
  </div>
</aside>

    {/* CHAT SECTION - Show on mobile when chat is open */}
    <section className={`${showChatOnMobile ? "flex" : "hidden"} md:flex flex-1 min-w-0 h-full flex-col`}>

{channel ? (
  <Channel channel={channel}>
    <div className="relative w-full flex flex-col h-full p-1.5">

    <div className="absolute top-16 left-5 z-10 flex items-center gap-2">
            {/* Back button for mobile */}
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={goBackToContacts}
              title="Go Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>

      <div className="absolute top-3 right-7 z-10">
        <button
          className="btn btn-sm btn-ghost "
          onClick={async () => {
            const callLink = `${window.location.origin}/call/${channel.id}`;
            await channel.sendMessage({
              text: `📞 ${authUser.fullName} started a video call. Join here: ${callLink}`,
            });
            toast.success("Call link sent!");
            navigate(`/call/${channel.id}`);
          }}
        >
          <VideoIcon  className="size-8"/>
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex flex-col h-full">

        {/* HEADER (fixed) */}
        <div className="flex-shrink-0 border-b border-base-300">
          <ChannelHeader />
        </div>

        {/* MESSAGE AREA (SCROLL ONLY HERE) */}
        <div className="flex-1 overflow-hidden">
          <Window>
            <div className="h-full overflow-y-auto ">
              <MessageList />
            </div>

            <TypingIndicator />

            {/* INPUT (fixed bottom) */}
            <div className="flex-shrink-0 border-t border-base-300 bg-base-100">
              <MessageInput focus />
            </div>
          </Window>
        </div>

      </div>
    </div>

    <Thread />
  </Channel>
) : (
  <div className="flex-1 flex items-center justify-center text-base-content/50">
    Select a chat
  </div>
)}
</section>

  </div>
</div>
  );
};

export default MessagesPage;