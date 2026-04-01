import { useEffect, useState, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import FriendCard from "../components/FriendCard";
import ConfirmModal from "../models/ConfirmModel";
import { usePinnedFriends } from "../context/PinnedFriendsContext";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const { pinnedFriends } = usePinnedFriends();
  const [friendToRemove, setFriendToRemove] = useState(null);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friends");
      return res.data.friends || [];
    },
  });

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const aPinned = pinnedFriends.includes(a._id);
      const bPinned = pinnedFriends.includes(b._id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [friends, pinnedFriends]);

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
  };
 
  const confirmRemove = async () => {
    try {
      const res = await axiosInstance.delete(
        `/users/friends/${friendToRemove._id}`
      );

      if (res.status !== 200 && res.status !== 204) {
        throw new Error("Remove failed");
      }

      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch {
      alert("Failed to remove friend");
    } finally {
      setFriendToRemove(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading friends...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Friends</h1>

      {sortedFriends.length === 0 ? (
        <div className="card bg-base-200 p-6 text-center h-full">
        <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
        <p className="text-base-content opacity-70">
          Connect with language partners to start practicing together!
        </p>
      </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFriends.map((friend) => (
            <div
              key={friend._id}
              className="transition-all duration-300 ease-in-out"
            >
              <FriendCard
                key={friend._id}
                friend={friend}
                showRemove={true}
                onRemove={handleRemoveFriend}
                showActions={true}
              />
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={!!friendToRemove}
        title="Remove Friend"
        message={`Are you sure you want to remove ${friendToRemove?.fullName}?`}
        onCancel={() => setFriendToRemove(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
};

export default FriendsPage;
