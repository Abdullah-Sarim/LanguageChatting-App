import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { ArrowLeft } from "lucide-react";

import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  TypingIndicator,
} from "stream-chat-react";

import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { useStreamChat } from "../context/StreamChatContext";

const ChatPage = () => {
  const navigate = useNavigate();
  const { id: targetUserId } = useParams();

  const { authUser } = useAuthUser();
  const { client } = useStreamChat();

  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!client || !authUser || !targetUserId) return;

    const initChannel = async () => {
      try {
        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing channel:", error);
        toast.error("Could not open chat. Please try again.");
      }
    };

    initChannel();
  }, [client, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (!channel) return;

    const callUrl = `${window.location.origin}/call/${channel.id}`;

    channel.sendMessage({
      text: `I've started a video call. Join me here: ${callUrl}`,
    });

    toast.success("Video call link sent successfully!");
  };

  if (!client || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Channel channel={channel}>
        {/* <div className="w-full relative"> */}
        <div className="relative mx-auto w-10/12 sm:10/12  md:w-full">


          {/* Top action buttons */}
          <div className="absolute top-15 left-3 z-10 flex items-center gap-2">
            {/* Back button */}
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => navigate(-1)}
              title="Go Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute top-3 right-6 z-10">
            <CallButton handleVideoCall={handleVideoCall} />
          </div>

          <Window>
            <ChannelHeader />
            <MessageList />
            <TypingIndicator />
            <MessageInput focus />
          </Window>
        </div>

        <Thread />
      </Channel>
    </div>
  );
};

export default ChatPage;
