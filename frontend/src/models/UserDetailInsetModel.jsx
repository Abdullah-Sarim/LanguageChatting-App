import { X, Star } from "lucide-react";
import { useState } from "react";
import { getLanguageFlag } from "../components/FriendCard";
import { capitialize } from "../lib/utils";
import { useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";

const StarRating = ({ rating, onRate, readonly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={24}
          className={`transition-colors ${
            star <= (hover || rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-base-content/30"
          } ${!readonly ? "cursor-pointer" : ""}`}
          onClick={() => !readonly && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        />
      ))}
    </div>
  );
};

const UserProfileInsetModal = ({
  isOpen,
  onClose,
  user,
  onSendRequest,
  isSending,
  isFriend,
  hasPendingRequest,
}) => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState(0);

  const { mutate: rateUser, isPending: isRating } = useMutation({
    mutationFn: ({ userId, rating }) =>
      axiosInstance.put(`/users/rate/${userId}`, { rating }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  const handleRate = (rating) => {
    setUserRating(rating);
    rateUser({ userId: user._id, rating });
  };

  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Inset Box */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-base-200 rounded-2xl shadow-xl relative animate-scaleIn">
          {/* Close button */}
          <button
            className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <X />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Avatar */}
            <div className="avatar mb-4">
              <div className="w-30 rounded-full ring ring-primary ring-offset-2">
                <img src={user.profilePic} alt={user.fullName} />
              </div>
            </div>

            {/* Name */}
            <h2 className="text-[25px] font-bold">{user.fullName}</h2>

            {/* Rating Display - always show if user has ratings */}
            {(user.averageRating || user.totalRatings) && (
              <div className="mt-2">
                <div className="flex items-center justify-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold text-lg">
                    {user.averageRating || 0}
                  </span>
                  <span className="text-base-content/60">
                    ({user.totalRatings || 0} {user.totalRatings === 1 ? "rating" : "ratings"})
                  </span>
                </div>
              </div>
            )}

            {/* Rate Friend (only if friend and not self) */}
            {isFriend && authUser?._id !== user._id && (
              <div className="mt-3">
                <p className="text-sm text-base-content/60 mb-1">Rate this friend</p>
                <StarRating rating={userRating} onRate={handleRate} />
              </div>
            )}

            {/* Always show rating for non-friends if they have ratings */}
            {!isFriend && (user.averageRating > 0 || user.totalRatings > 0) && (
              <div className="mt-3">
                <p className="text-sm text-base-content/60 mb-1">Community Rating</p>
                <StarRating rating={user.averageRating} readonly={true} />
              </div>
            )}

            {/* Bio */}
            <p className="text-[16px] text-base-content/75 my-2">
              {user.bio || "No bio added"}
            </p>

            {/* Languages */}
            <div className="flex justify-center gap-5 mt-3 flex-wrap">
              <span className="p-4 text-[14px] badge badge-outline">
                {getLanguageFlag(user.nativeLanguage)}
                Native: {capitialize(user.nativeLanguage)}
              </span>
              <span className="p-4 text-[14px] badge badge-outline">
                {getLanguageFlag(user.learningLanguage)}
                Learning: {capitialize(user.learningLanguage)}
              </span>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3 mt-5 text-[16px]">
              <Info label="Location" value={user.location || "—"} />
              <Info label="Friends" value={user.friends?.length || 0} />
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-6 justify-center">
              {!isFriend && !hasPendingRequest && (
                <button
                  className="btn btn-primary w-40"
                  onClick={() => onSendRequest(user._id)}
                  disabled={isSending}
                >
                  Send Friend Request
                </button>
              )}

              {hasPendingRequest && (
                <button className="btn btn-disabled w-40">Request Sent</button>
              )}

              {isFriend && (
                <button
                  className="btn btn-outline w-40"
                  onClick={() => {
                    onClose();
                    navigate(`/messages?friendId=${user._id}`);
                  }}
                >
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-base-100 rounded-xl p-3">
    <p className="text-xs text-base-content/60">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default UserProfileInsetModal;
