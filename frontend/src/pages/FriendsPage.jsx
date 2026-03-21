import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import FriendCard from "../components/FriendCard";
import ConfirmModal from "../models/ConfirmModel";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState(null);

  const fetchFriends = async () => {
    try {
      const res = await axiosInstance.get("/users/friends");

      const pinnedFriends = JSON.parse(localStorage.getItem("pinnedFriends")) || [];
      const allFriends = Array.isArray(res.data.friends) ? res.data.friends : [];
      
      const sortedFriends = allFriends.sort((a, b) => {
        const aPinned = pinnedFriends.includes(a._id);
        const bPinned = pinnedFriends.includes(b._id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });

      setFriends(sortedFriends);
    } catch (err) {
      setFriends([]); // never undefined
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

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
      
      fetchFriends();
    } catch {
      alert("Failed to remove friend");
    } finally {
      setFriendToRemove(null);
    }
  };

  if (loading) return <div className="p-4">Loading friends...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Friends</h1>

      {friends?.length === 0 ? (
        <p>No friends yet </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
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
