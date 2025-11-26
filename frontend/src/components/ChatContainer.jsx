import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ImagePreview from "./ImagePreview";
import EmojiPicker from "./EmojiPicker";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    addReaction,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  const getUserReaction = (message) => {
    if (!message.reactions || message.reactions.length === 0) return null;
    const userReaction = message.reactions.find(
      (r) => r.userId === authUser._id
    );
    return userReaction?.emoji || null;
  };

  const getReactionCounts = (message) => {
    if (!message.reactions || message.reactions.length === 0) return {};

    const counts = {};
    message.reactions.forEach((reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const reactionCounts = getReactionCounts(msg);
              const hasReactions = Object.keys(reactionCounts).length > 0;

              return (
                <div
                  key={msg._id}
                  className={`chat ${
                    msg.senderId === authUser._id ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="relative group">
                    <div
                      className={`chat-bubble relative ${
                        msg.senderId === authUser._id
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(msg.image)}
                        />
                      )}
                      {msg.text && <p className="mt-2">{msg.text}</p>}
                      <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Reaction display */}
                      {hasReactions && (
                        <div className="absolute -bottom-3 left-2 flex gap-1 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-700 shadow-lg">
                          {Object.entries(reactionCounts).map(
                            ([emoji, count]) => (
                              <div
                                key={emoji}
                                className="flex items-center gap-0.5 text-xs cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => handleReaction(msg._id, emoji)}
                              >
                                <span>{emoji}</span>
                                {count > 1 && (
                                  <span className="text-white/70 font-medium">
                                    {count}
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Emoji picker - shows on hover */}
                    <div
                      className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        msg.senderId === authUser._id
                          ? "right-full mr-2"
                          : "left-full ml-2"
                      }`}
                    >
                      <EmojiPicker
                        onSelectEmoji={(emoji) =>
                          handleReaction(msg._id, emoji)
                        }
                        currentReaction={getUserReaction(msg)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreview imageUrl={previewImage} onClose={handleClosePreview} />
      )}
    </>
  );
}

export default ChatContainer;
