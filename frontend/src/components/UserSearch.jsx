import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest, getOutgoingFriendReqs } from "../lib/api";
import UserProfileInsetModal from "../models/UserDetailInsetModel";
import { Search, UserRoundSearch } from "lucide-react";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const queryClient = useQueryClient();

  const { authUser } = useAuthUser();

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      setSelectedUser(null);
    },
  });

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) return setResults([]);

    const res = await axiosInstance.get(`/users/search?q=${value}`);
    setResults(res.data);
  };

  const isFriend = authUser?.friends?.includes(selectedUser?._id);

  const hasPendingRequest = outgoingFriendReqs?.some(
    (req) => req.recipient._id === selectedUser?._id
  );

  return (
    <>
      <UserRoundSearch className="hidden sm:block"/>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search users..."
          className="input input-bordered w-28 sm:w-50"
        />

        {results.length > 0 && (
          <div className="absolute w-full bg-base-100 border rounded mt-2 z-10">
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center gap-3 p-2 hover:bg-base-200 text-left"
              >
                <img src={user.profilePic} className="w-8 h-8 rounded-full" />
                <span>{user.fullName}</span>
              </button>
            ))}
          </div>
        )}

        {/*USER PROFILE INSET */}
        <UserProfileInsetModal
          isOpen={!!selectedUser}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSendRequest={sendRequest}
          isSending={isPending}
          isFriend={isFriend}
          hasPendingRequest={hasPendingRequest}
        />
      </div>
    </>
  );
};

export default UserSearch;
