import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const StreamChatContext = createContext(null);

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const StreamChatProvider = ({ children }) => {
  const { authUser } = useAuthUser();
  const [client, setClient] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    const init = async () => {
      const chatClient = StreamChat.getInstance(STREAM_API_KEY);

      await chatClient.connectUser(
        {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      setClient(chatClient);
    };

    init();

    return () => {
      if (client) client.disconnectUser();
    };
  }, [authUser, tokenData]);

  if (!client) return null;

  return (
    <StreamChatContext.Provider value={{ client }}>
      <Chat client={client}>{children}</Chat>
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => useContext(StreamChatContext);
