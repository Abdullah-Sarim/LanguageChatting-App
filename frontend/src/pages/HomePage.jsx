import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  Star,
} from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import UserSearch from "../components/UserSearch";
import NoFriendsFound from "../components/NoFriendsFound";
import { useStreamChat } from "../context/StreamChatContext";
import { usePinnedFriends } from "../context/PinnedFriendsContext";
import { LANGUAGES } from "../constants";

const HomePage = () => {
  const { client } = useStreamChat();
  const { pinnedFriends } = usePinnedFriends();

  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [nativeFilter, setNativeFilter] = useState("");
  const [learningFilter, setLearningFilter] = useState("");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const safeFriends = Array.isArray(friends) ? friends : [];
  const pinnedFriendList = safeFriends.filter(friend => pinnedFriends.includes(friend._id));

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", filter, nativeFilter, learningFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === "topRated") params.append("minRating", "3");
      if (filter === "bestMatch") params.append("bestMatch", "true");
      if (nativeFilter) params.append("nativeLanguage", nativeFilter);
      if (learningFilter) params.append("learningLanguage", learningFilter);
      console.log("Fetching with params:", params.toString());
      return getRecommendedUsers(params.toString());
    },
    staleTime: 0,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  const sortedFriends = [...pinnedFriendList].sort((a, b) => {
    const aOnline = client?.state?.users?.[a._id]?.online ? 1 : 0;
    const bOnline = client?.state?.users?.[b._id]?.online ? 1 : 0;
    return bOnline - aOnline;
  });
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setNativeFilter("");
    setLearningFilter("");
  };

  const handleClearFilters = () => {
    setFilter("all");
    setNativeFilter("");
    setLearningFilter("");
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className=" container mx-auto space-y-10 min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Pinned Friends
          </h2>
          
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : pinnedFriendList.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} showActions= {false} />
            ))}
          </div>
        )}

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Meet New Learners
              </h2>
              <p className="opacity-70">
                Discover perfect language exchange partners based on your
                profile
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleFilterChange("all")}
            >
              All Users
            </button>
            <button
              className={`btn btn-sm ${filter === "bestMatch" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleFilterChange("bestMatch")}
            >
              Best Match
            </button>
            <button
              className={`btn btn-sm ${filter === "topRated" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleFilterChange("topRated")}
            >
              Top Rated 3+ ⭐
            </button>
            {(filter !== "all" || nativeFilter || learningFilter) && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <select
              className="select select-bordered select-sm"
              value={nativeFilter}
              onChange={(e) => {
                setNativeFilter(e.target.value);
                setFilter("all");
              }}
            >
              <option value="">Native Language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm"
              value={learningFilter}
              onChange={(e) => {
                setLearningFilter(e.target.value);
                setFilter("all");
              }}
            >
              <option value="">Learning Language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent =
                outgoingRequestsIds instanceof Set &&
                outgoingRequestsIds.has(user._id);
               

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                              {user.fullName}
                            </h3>
                            {user.matchType && user.matchType !== "none" && (
                              <span className={`badge badge-sm ${
                                user.matchType === "perfect" ? "badge-success" :
                                user.matchType === "teaching" ? "badge-warning" :
                                "badge-info"
                              }`}>
                                {user.matchType === "perfect" ? "★ Perfect" :
                                 user.matchType === "teaching" ? "Teaches You" :
                                 "Learns Your Lang"}
                              </span>
                            )}
                          </div>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-70">{user.bio}</p>
                      )}

                      {/* Rating Display */}
                      {(user.averageRating > 0 || user.totalRatings > 0) && (
                        <div className="flex items-center gap-1">
                          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4" />
                          <span className="text-sm font-medium">{user.averageRating}</span>
                          <span className="text-xs text-base-content/60">
                            ({user.totalRatings})
                          </span>
                        </div>
                      )}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
