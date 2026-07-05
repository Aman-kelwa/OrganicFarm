import { useState, useRef, useEffect } from "react";
import { Sprout, Send, Bot, User, Sparkles } from "lucide-react";
import api from "../services/api";

const SUGGESTIONS = [
  "Best fertilizer for wheat?",
  "How to control pest in tomato?",
  "Ideal irrigation schedule for cotton",
  "Tractor vs power tiller for small farms",
];

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "🌱 Hello! I am OrganicFarm AI.\n\nAsk me anything about farming, crops, irrigation, fertilizers, machinery, or agricultural equipment.\n\nआप मुझसे खेती से जुड़ा कोई भी सवाल पूछ सकते हैं।",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message,
      });

      const aiMessage = {
        sender: "ai",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Something went wrong.",
        },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  const handleSuggestion = (text) => {
    setMessage(text);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif] relative overflow-hidden">
      {/* ambient glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#5C9E31]/12 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[380px] h-[380px] rounded-full bg-sky-500/8 blur-[110px]" />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-10 h-screen flex flex-col">
        {/* ── header ── */}
        <div className="animate-[riseIn_0.45s_ease-out] mb-5 flex items-center gap-4 shrink-0">
          <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-[#5C9E31]/20 border border-[#5C9E31]/30">
            <Sprout size={22} className="text-[#A8E063]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#A8E063] shadow-[0_0_10px_rgba(168,224,99,0.8)] animate-pulse" />
          </span>
          <div>
            <p className="font-['Space_Mono',monospace] text-[11px] text-[#5C9E31] tracking-widest uppercase mb-0.5">
              Always Online
            </p>
            <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold leading-tight">
              OrganicFarm AI Assistant
            </h1>
          </div>
        </div>

        {/* ── chat frame ── */}
        <div className="flex-1 min-h-0 rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-sm flex flex-col overflow-hidden animate-[riseIn_0.5s_ease-out_0.1s_both]">
          {/* messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-5 scroll-smooth"
          >
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2.5 animate-[fadeUp_0.35s_ease-out_both] ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <span className="grid place-items-center w-8 h-8 rounded-xl bg-[#5C9E31]/20 border border-[#5C9E31]/25 shrink-0">
                      <Bot size={15} className="text-[#A8E063]" />
                    </span>
                  )}

                  <div
                    className={`max-w-[75%] whitespace-pre-wrap px-5 py-3.5 text-[14.5px] leading-relaxed rounded-2xl border ${
                      isUser
                        ? "bg-[#5C9E31] border-[#5C9E31] text-white rounded-br-md"
                        : "bg-white/6 border-white/10 text-white/85 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {isUser && (
                    <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/8 border border-white/12 shrink-0">
                      <User size={15} className="text-white/60" />
                    </span>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-2.5 justify-start animate-[fadeUp_0.3s_ease-out_both]">
                <span className="grid place-items-center w-8 h-8 rounded-xl bg-[#5C9E31]/20 border border-[#5C9E31]/25 shrink-0">
                  <Bot size={15} className="text-[#A8E063]" />
                </span>
                <div className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-2xl rounded-bl-md px-5 py-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8E063]/70 animate-[bounceDot_1s_infinite_-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8E063]/70 animate-[bounceDot_1s_infinite_-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8E063]/70 animate-[bounceDot_1s_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* suggestions — only before conversation grows */}
          {messages.length === 1 && !loading && (
            <div className="px-5 sm:px-7 pb-4 flex flex-wrap gap-2 animate-[fadeUp_0.4s_ease-out_0.15s_both]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[#A8E063] bg-white/4 hover:bg-[#5C9E31]/10 border border-white/8 hover:border-[#5C9E31]/30 rounded-full px-3.5 py-2 transition-all duration-200"
                >
                  <Sparkles size={11} />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <div className="border-t border-white/8 p-4 sm:p-5 flex gap-3 shrink-0 bg-white/[0.02]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask your farming question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[14.5px] text-white
                placeholder:text-white/25 outline-none
                focus:border-[#5C9E31]/55 focus:bg-white/8 focus:ring-1 focus:ring-[#5C9E31]/20
                transition-all duration-200"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#5C9E31] hover:bg-[#4E8A28] disabled:opacity-40
                text-white font-semibold px-6 rounded-xl shadow-[0_0_20px_rgba(92,158,49,0.3)]
                hover:shadow-[0_0_28px_rgba(92,158,49,0.45)] active:scale-95 transition-all duration-200"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AIChat;
