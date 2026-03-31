import { createContext, useContext, useState, useEffect } from "react";

const PinnedFriendsContext = createContext();

export const PinnedFriendsProvider = ({ children }) => {
  const [pinnedFriends, setPinnedFriends] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("pinnedFriends")) || [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("pinnedFriends", JSON.stringify(pinnedFriends));
  }, [pinnedFriends]);

  const togglePin = (friendId) => {
    setPinnedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      }
      return [...prev, friendId];
    });
  };

  const isPinned = (friendId) => pinnedFriends.includes(friendId);

  return (
    <PinnedFriendsContext.Provider value={{ pinnedFriends, togglePin, isPinned }}>
      {children}
    </PinnedFriendsContext.Provider>
  );
};

export const usePinnedFriends = () => {
  const context = useContext(PinnedFriendsContext);
  if (!context) {
    throw new Error("usePinnedFriends must be used within PinnedFriendsProvider");
  }
  return context;
};
