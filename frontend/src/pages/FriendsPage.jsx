import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import FriendCard from "../components/FriendCard";
import ConfirmModal from "../models/ConfirmModel";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState(null);

  const fetchFriends = async () => {
    try {
      const res = await axiosInstance.get("/users/friends");


      setFriends(Array.isArray(res.data.friends) ? res.data.friends : []);
    } catch (err) {
      setFriends([]); // never undefined
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // const handleRemoveFriend = async (friendId) => {
  //   if (!confirm("Remove this friend?")) return;

  //   try {
  //     await axiosInstance.delete(`/users/friends/${friendId}`);
  //     setFriends((prev) => prev.filter((f) => f._id !== friendId));
  //   } catch (error) {
  //     alert("Failed to remove friend");
  //   }
  // };

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
  };
  // const confirmRemove = async () => {
  //   try {
  //     await axiosInstance.delete(`/users/friends/${friendToRemove._id}`);
  //     setFriends((prev) => prev.filter((f) => f._id !== friendToRemove._id));
  //   } catch {
  //     alert("Failed to remove friend");
  //   } finally {
  //     setFriendToRemove(null);
  //   }
  // };

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
