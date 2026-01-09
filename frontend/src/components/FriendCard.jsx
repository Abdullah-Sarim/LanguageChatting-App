import { Link } from "react-router";
import { useChatContext } from "stream-chat-react";
import { LANGUAGE_TO_FLAG } from "../constants";
import { EllipsisVertical, Pin, PinOff } from "lucide-react";

const FriendCard = ({
  friend,
  showRemove = false,
  onRemove,
  showActions = false,
}) => {
  const { client } = useChatContext();

  /* STREAM PRESENCE*/
  const streamUser = client?.state?.users?.[friend._id];
  const isOnline = streamUser?.online;
  const lastActive = streamUser?.last_active;

  /*LAST SEEN*/
  const formatLastSeen = (date) => {
    if (!date) return "Offline";

    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `Last seen ${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Last seen ${hours}h ago`;

    return "Last seen yesterday";
  };

  /*UNREAD COUNT */
  const channelId = client
    ? [client.userID, friend._id].sort().join("-")
    : null;

  const channel = channelId ? client?.channel("messaging", channelId) : null;

  const unreadCount = channel?.state?.unreadCount || 0;

  /*PIN FRIEND (local) */
  const pinnedFriends = JSON.parse(localStorage.getItem("pinnedFriends")) || [];

  const isPinned = pinnedFriends.includes(friend._id);

  const togglePin = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = isPinned
      ? pinnedFriends.filter((id) => id !== friend._id)
      : [...pinnedFriends, friend._id];

    localStorage.setItem("pinnedFriends", JSON.stringify(updated));
  };

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow relative">
      {/*Pin Button */}
      <button
        onClick={togglePin}
        className="absolute top-2 right-8 btn btn-ghost btn-xs"
        title={isPinned ? "Unpin friend" : "Pin friend"}
      >
        {isPinned ? (
          <Pin className="w-5 h-5" />
        ) : (
          <PinOff className="w-4 h-4" />
        )}
      </button>

      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div className="relative avatar size-12">
            <img
              src={
                friend.profilePic?.trim()
                  ? friend.profilePic
                  : "/avatars/avatar7.png"
              }
              alt={friend.fullName}
            />

            {/* Online / Offline Dot */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-200 ${
                isOnline ? "bg-success" : "bg-gray-400"
              }`}
            />

            {/*Unread Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>

            {/* Status */}
            <p className="text-xs text-base-content/60">
              {isOnline ? "Online" : formatLastSeen(lastActive)}
            </p>
          </div>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        {/* ACTION */}
        {/* <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link> */}

        <div className="flex gap-2 mt-2">
          <Link to={`/chat/${friend._id}`} className="btn btn-outline flex-1">
            Message
          </Link>

          {showActions && (
            <div className="absolute top-2 right-1 dropdown dropdown-end">
              <button className="btn btn-ghost btn-xs">
                <EllipsisVertical className="w-5 h-5" />
              </button>

              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-50">
                <li>
                  <Link to={`/chat/${friend._id}`}>💬 Message</Link>
                </li>

                {showRemove && (
                  <li>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove(friend);
                      }}
                      className="text-error"
                    >
                      ❌ Remove Friend
                    </button>
                  </li>
                )}

                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      alert("Block user (next step)");
                    }}
                  >
                    🚫 Block User
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;

/*LANGUAGE FLAG HELPER*/
export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
