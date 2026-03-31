import { useState } from "react";
import { Link } from "react-router";
import { useChatContext } from "stream-chat-react";
import { LANGUAGE_TO_FLAG } from "../constants";
import { EllipsisVertical, Pin, PinOff, Star } from "lucide-react";
import { blockUser } from "../lib/api";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePinnedFriends } from "../context/PinnedFriendsContext";

const FriendCard = ({
  friend,
  showRemove = false,
  onRemove,
  showActions = false,
}) => {
  const { client } = useChatContext();
  const queryClient = useQueryClient();
  const { togglePin: updatePin, isPinned: checkIsPinned } = usePinnedFriends();
  const [isBlocking, setIsBlocking] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const isPinned = checkIsPinned(friend._id);

  const handleTogglePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updatePin(friend._id);
  };

  const handleBlock = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to block ${friend.fullName}?`)) return;

    try {
      setIsBlocking(true);
      await blockUser(friend._id);
      toast.success(`Blocked ${friend.fullName}`);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const { mutate: rateUser, isPending: isRating } = useMutation({
    mutationFn: ({ userId, rating }) =>
      axiosInstance.put(`/users/rate/${userId}`, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Rating submitted!");
    },
    onError: () => {
      toast.error("Failed to submit rating");
    },
  });

  const handleRate = (rating) => {
    rateUser({ userId: friend._id, rating });
  };

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

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow relative">
      {/*Pin Button */}
      <button
        onClick={handleTogglePin}
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

        {/* RATING */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRate(star);
              }}
              disabled={isRating}
              className="focus:outline-none"
            >
              <Star
                size={18}
                className={`transition-colors ${
                  star <= (hoverRating || friend.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-base-content/30"
                }`}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setHoverRating(star);
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setHoverRating(0);
                }}
              />
            </button>
          ))}
          {friend.totalRatings > 0 && (
            <span className="text-xs text-base-content/60 ml-1">
              ({friend.totalRatings})
            </span>
          )}
        </div>

        {/* ACTION */}
        {/* <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link> */}

        <div className="flex gap-2 mt-2">
          <Link to={`/messages?friendId=${friend._id}`} className="btn btn-outline flex-1">
            Message
          </Link>

          {showActions && (
            <div className="absolute top-2 right-1 dropdown dropdown-end">
              <button className="btn btn-ghost btn-xs">
                <EllipsisVertical className="w-5 h-5" />
              </button>

              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-50">
                <li>
                  <Link to={`/messages?friendId=${friend._id}`}>💬 Message</Link>
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
                    onClick={handleBlock}
                    disabled={isBlocking}
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
