import { useState } from "react";
import {
  Smile,
  Heart,
  ThumbsUp,
  Laugh,
  PartyPopper,
  Flame,
  Star,
  Sparkles,
} from "lucide-react";

// Emoji categories
const EMOJI_CATEGORIES = {
  quick: {
    name: "Quick",
    icon: Smile,
    emojis: ["👍", "❤️", "😂", "😮", "😢", "🙏"],
  },
  smileys: {
    name: "Smileys",
    icon: Laugh,
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "🥲",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
    ],
  },
  gestures: {
    name: "Gestures",
    icon: ThumbsUp,
    emojis: [
      "👍",
      "👎",
      "👊",
      "✊",
      "🤛",
      "🤜",
      "🤞",
      "✌️",
      "🤟",
      "🤘",
      "👌",
      "🤌",
      "🤏",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
    ],
  },
  hearts: {
    name: "Hearts",
    icon: Heart,
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
    ],
  },
  celebration: {
    name: "Celebration",
    icon: PartyPopper,
    emojis: [
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🎀",
      "🎂",
      "🍰",
      "🧁",
      "🥳",
      "🎆",
      "🎇",
      "✨",
      "🎃",
      "🎄",
      "🎋",
      "🎍",
      "🎏",
      "🎐",
      "🎑",
    ],
  },
  symbols: {
    name: "Symbols",
    icon: Star,
    emojis: [
      "⭐",
      "🌟",
      "💫",
      "✨",
      "💥",
      "💢",
      "💨",
      "💦",
      "💤",
      "🔥",
      "💯",
      "✅",
      "❌",
      "❗",
      "❓",
      "⚡",
      "🌈",
      "☀️",
      "⛅",
      "☁️",
      "🌙",
      "⭐",
    ],
  },
};

function EmojiPicker({ onSelectEmoji, currentReaction }) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState("quick");

  const handleEmojiClick = (emoji) => {
    onSelectEmoji(emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(!showPicker);
        }}
        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
        title="Add reaction"
      >
        <Smile size={16} />
      </button>

      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />

          {/* Emoji Picker Popup */}
          <div className="absolute bottom-full right-0 mb-2 z-20 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Category Tabs */}
            <div className="flex gap-1 p-2 bg-slate-900/50 border-b border-slate-700">
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                const isActive = activeCategory === key;
                // Get first emoji as representative
                const representativeEmoji = category.emojis[0];

                return (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCategory(key);
                    }}
                    className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                      isActive
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                    title={category.name}
                  >
                    {isActive ? (
                      <span className="text-xl leading-none">
                        {representativeEmoji}
                      </span>
                    ) : (
                      <Icon size={16} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Emoji Grid */}
            <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmojiClick(emoji);
                    }}
                    className={`flex items-center justify-center w-10 h-10 text-2xl rounded-lg transition-all duration-200 hover:scale-110 ${
                      currentReaction === emoji
                        ? "bg-cyan-600 text-white ring-2 ring-cyan-300"
                        : "hover:bg-slate-700"
                    }`}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer with category name */}
            <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-700 text-xs text-slate-400 text-center">
              {EMOJI_CATEGORIES[activeCategory].name} • Click to react
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </div>
  );
}

export default EmojiPicker;
