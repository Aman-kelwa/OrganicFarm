/*
  OrganicFarm – AI Chat (Design System v2: light & simple)
  Same tokens and patterns as the other pages:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
  Fonts (index.html): Inter only
*/

import { useState, useRef, useEffect } from "react";
import { Sprout, Send, Bot, User, Sparkles } from "lucide-react";
import api from "../services/api";

/* ─── shared style primitives ─── */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

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
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif] overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-24 pb-6 h-[100dvh] flex flex-col">
        {/* ── header ── */}
        <div className="animate-[riseIn_0.45s_ease-out] motion-reduce:animate-none mb-4 flex items-center gap-4 shrink-0">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
            <Sprout size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#2E7D32] mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              Always online
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              OrganicFarm AI Assistant
            </h1>
          </div>
        </div>

        {/* ── chat frame ── */}
        <div className="flex-1 min-h-0 rounded-2xl border border-[#E4E8E1] bg-white shadow-sm flex flex-col overflow-hidden animate-[riseIn_0.5s_ease-out_0.1s_both] motion-reduce:animate-none">
          {/* messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            className="flex-1 overflow-y-auto px-4 sm:px-7 py-6 space-y-5 scroll-smooth"
          >
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2.5 animate-[fadeUp_0.3s_ease-out_both] motion-reduce:animate-none ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                      <Bot size={16} aria-hidden="true" />
                      <span className="sr-only">Assistant</span>
                    </span>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap break-words px-4 sm:px-5 py-3 text-[14.5px] leading-relaxed rounded-2xl border ${
                      isUser
                        ? "bg-[#2E7D32] border-[#2E7D32] text-white rounded-br-md"
                        : "bg-[#F6F8F4] border-[#E4E8E1] text-[#1F2A1C] rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {isUser && (
                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-[#F6F8F4] border border-[#E4E8E1] text-[#5B6559] shrink-0">
                      <User size={16} aria-hidden="true" />
                      <span className="sr-only">You</span>
                    </span>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-2.5 justify-start animate-[fadeUp_0.3s_ease-out_both] motion-reduce:animate-none">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                  <Bot size={16} aria-hidden="true" />
                </span>
                <div
                  className="flex items-center gap-1.5 bg-[#F6F8F4] border border-[#E4E8E1] rounded-2xl rounded-bl-md px-5 py-4"
                  role="status"
                  aria-label="Assistant is typing"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/70 animate-[bounceDot_1s_infinite_-0.3s] motion-reduce:animate-none" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/70 animate-[bounceDot_1s_infinite_-0.15s] motion-reduce:animate-none" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/70 animate-[bounceDot_1s_infinite] motion-reduce:animate-none" />
                </div>
              </div>
            )}
          </div>

          {/* suggestions — only before conversation grows */}
          {messages.length === 1 && !loading && (
            <div className="px-4 sm:px-7 pb-4 flex flex-wrap gap-2 animate-[fadeUp_0.4s_ease-out_0.15s_both] motion-reduce:animate-none">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className={`flex items-center gap-1.5 text-[13px] text-[#5B6559] hover:text-[#2E7D32] bg-white hover:bg-[#EAF4E6] border border-[#D5DBD0] hover:border-[#2E7D32]/50 rounded-full px-3.5 py-2 transition-colors duration-200 ${focusRing}`}
                >
                  <Sparkles size={12} aria-hidden="true" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <div className="border-t border-[#E4E8E1] p-3 sm:p-4 flex gap-3 shrink-0 bg-[#F6F8F4]/60">
            <input
              ref={inputRef}
              type="text"
              aria-label="Your farming question"
              placeholder="Ask your farming question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 min-w-0 h-12 bg-white border border-[#D5DBD0] rounded-xl px-4 text-[14.5px] text-[#1F2A1C]
                placeholder:text-[#7A8576] outline-none
                focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20
                transition-colors duration-200"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              aria-label="Send message"
              className={`flex items-center justify-center gap-2 h-12 bg-[#2E7D32] hover:bg-[#256628] disabled:opacity-50
                text-white text-sm font-semibold px-4 sm:px-6 rounded-xl
                active:scale-[0.98] transition-colors duration-200 ${focusRing}`}
            >
              <Send size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
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
