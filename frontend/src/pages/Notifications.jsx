import { useEffect, useState, useRef } from "react";
import {
  Bell,
  ShoppingBag,
  CreditCard,
  Star,
  Info,
  Check,
  CheckCheck,
  BellOff,
  Clock,
  Filter,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import socket from "../socket";
import api from "../services/api";

/* ── reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, v] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── notification type config ── */
const TYPE_META = {
  order: {
    icon: ShoppingBag,
    color: "text-amber-400",
    bg: "bg-amber-400/10   border-amber-400/25",
    dot: "bg-amber-400",
    label: "Order",
  },
  payment: {
    icon: CreditCard,
    color: "text-[#A8E063]",
    bg: "bg-[#5C9E31]/12  border-[#5C9E31]/30",
    dot: "bg-[#A8E063]",
    label: "Payment",
  },
  review: {
    icon: Star,
    color: "text-purple-400",
    bg: "bg-purple-400/10  border-purple-400/25",
    dot: "bg-purple-400",
    label: "Review",
  },
  system: {
    icon: Info,
    color: "text-sky-400",
    bg: "bg-sky-400/10     border-sky-400/25",
    dot: "bg-sky-400",
    label: "System",
  },
};
const getMeta = (type) => TYPE_META[type] ?? TYPE_META.system;

/* ── relative time ── */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/* ── skeleton ── */
function Skeleton() {
  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-white/4 border border-white/8 animate-pulse">
      <div className="w-11 h-11 rounded-2xl bg-white/8 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-white/10 rounded-full w-3/4" />
        <div className="h-3   bg-white/7  rounded-full w-1/2" />
        <div className="h-3   bg-white/7  rounded-full w-1/3" />
      </div>
    </div>
  );
}

/* ── filter tabs ── */
const FILTERS = ["All", "Unread", "order", "payment", "review", "system"];

/* ════════════════════════════════════════════════════════ */
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [marking, setMarking] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [toast, setToast] = useState(null);
  const [newPing, setNewPing] = useState(false);
  const [deleteTarget, setDelete] = useState(null); // { id, message }

  /* ── fetch ── */
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications ?? []);
    } catch {
      showToast("Failed to load notifications.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ── real-time socket ── */
  useEffect(() => {
    const handler = () => {
      setNewPing(true);
      setTimeout(() => setNewPing(false), 1200);
      fetchNotifications();
    };
    socket.on("new-order", handler);
    socket.on("new-payment", handler);
    socket.on("new-review", handler);
    return () => {
      socket.off("new-order", handler);
      socket.off("new-payment", handler);
      socket.off("new-review", handler);
    };
  }, []);

  /* ── mark one as read ── */
  const markAsRead = async (id) => {
    setMarking(id);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      showToast("Could not mark as read.", false);
    } finally {
      setMarking(null);
    }
  };

  /* ── mark all as read ── */
  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length) return;
    setMarkingAll(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        unread.map((n) =>
          api.put(
            `/notifications/${n._id}/read`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("All notifications marked as read.", true);
    } catch {
      showToast("Could not mark all as read.", false);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── toast ── */
  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── delete one notification ── */
  const deleteNotification = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDelete(null);
    // optimistic: remove instantly
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Notification deleted.", true);
    } catch (err) {
      // rollback on failure
      fetchNotifications();
      showToast(err.response?.data?.message || "Delete failed.", false);
    }
  };

  /* ── derived ── */
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const visible = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.isRead;
    return n.type === filter;
  });

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif]">
      {/* ── toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold shadow-2xl animate-[slideRight_0.3s_ease-out] ${
            toast.ok
              ? "bg-[#0E140D] border-[#5C9E31]/40 text-[#A8E063]"
              : "bg-[#140e0e] border-red-500/40   text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${toast.ok ? "bg-[#A8E063]" : "bg-red-400"}`}
          />
          {toast.msg}
        </div>
      )}

      {/* ── delete confirm modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDelete(null)}
          />
          <div className="relative w-full max-w-md bg-[#0E140D] border border-white/10 rounded-3xl p-7 shadow-[0_30px_80px_rgba(0,0,0,0.8)] animate-[popIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="flex items-center gap-4 mb-5">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-red-500/12 border border-red-500/25 shrink-0">
                <AlertTriangle size={22} className="text-red-400" />
              </span>
              <div>
                <h3 className="font-['Playfair_Display',serif] text-lg font-bold">
                  Delete notification?
                </h3>
                <p className="text-sm text-white/40 mt-0.5">
                  This cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-white/55 bg-white/4 border border-white/8 rounded-xl px-4 py-3 mb-6 line-clamp-2">
              "{deleteTarget.message}"
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDelete(null)}
                className="flex-1 py-3 rounded-xl border border-white/12 text-white/60 hover:bg-white/6 font-semibold text-sm transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={deleteNotification}
                className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-semibold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex items-start justify-between gap-4 mb-10">
            <div>
              <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-2">
                Activity
              </p>
              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold flex items-center gap-4">
                Notifications
                {/* live ping icon */}
                <span
                  className={`relative inline-flex transition-transform duration-300 ${newPing ? "scale-125" : "scale-100"}`}
                >
                  <Bell
                    size={32}
                    className={`transition-colors duration-300 ${newPing ? "text-[#A8E063]" : "text-white/20"}`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-[#5C9E31] text-[10px] font-bold text-white shadow-[0_0_12px_rgba(92,158,49,0.7)] animate-[popIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              </h1>
              {!loading && (
                <p className="mt-2 text-sm text-white/40">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up 🌱"}
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C9E31]/12 border border-[#5C9E31]/25 text-[#A8E063] text-sm font-semibold hover:bg-[#5C9E31]/22 transition-all active:scale-95 disabled:opacity-50 shrink-0 mt-8"
              >
                {markingAll ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} />
                )}
                Mark all read
              </button>
            )}
          </div>
        </Reveal>

        {/* ── FILTER TABS ── */}
        <Reveal delay={80}>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
            {FILTERS.map((f) => {
              const count =
                f === "All"
                  ? notifications.length
                  : f === "Unread"
                    ? unreadCount
                    : notifications.filter((n) => n.type === f).length;
              const isActive = filter === f;
              const meta = TYPE_META[f];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#5C9E31] text-white shadow-[0_0_16px_rgba(92,158,49,0.4)]"
                      : "bg-white/5 text-white/50 border border-white/8 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {meta && <meta.icon size={13} />}
                  {f === "All"
                    ? "All"
                    : f === "Unread"
                      ? "Unread"
                      : (meta?.label ?? f)}
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/8 text-white/40"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ── LOADING ── */}
        {loading && (
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} />
              ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && notifications.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="relative grid place-items-center w-24 h-24 rounded-3xl bg-white/4 border border-white/8 mb-6">
                <BellOff size={40} className="text-white/15" />
              </span>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold mb-2">
                All quiet out here
              </h2>
              <p className="text-white/40 max-w-xs text-sm leading-relaxed">
                Order updates, payment confirmations and review alerts will show
                up here in real time.
              </p>
            </div>
          </Reveal>
        )}

        {/* ── NO FILTERED RESULTS ── */}
        {!loading && notifications.length > 0 && visible.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center py-16 text-center">
              <Filter size={36} className="text-white/15 mb-4" />
              <p className="font-semibold mb-1">
                No {filter.toLowerCase()} notifications
              </p>
              <button
                onClick={() => setFilter("All")}
                className="mt-4 px-4 py-2 text-sm rounded-xl border border-white/12 hover:bg-white/6 transition-all"
              >
                View all
              </button>
            </div>
          </Reveal>
        )}

        {/* ── NOTIFICATION LIST ── */}
        {!loading && visible.length > 0 && (
          <div className="space-y-3">
            {visible.map((n, i) => {
              const meta = getMeta(n.type);
              const Icon = meta.icon;
              const isNew = !n.isRead;
              const isBeingMarked = marking === n._id;

              return (
                <Reveal key={n._id} delay={i * 45}>
                  <div
                    className={`group relative flex gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                      isNew
                        ? "bg-white/6 border-white/14 hover:border-white/22 hover:bg-white/8"
                        : "bg-white/3 border-white/6  hover:border-white/12 hover:bg-white/5"
                    }`}
                  >
                    {/* unread left bar */}
                    {isNew && (
                      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#5C9E31]" />
                    )}

                    {/* icon */}
                    <span
                      className={`grid place-items-center w-11 h-11 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-110 ${meta.bg}`}
                    >
                      <Icon size={19} className={meta.color} />
                    </span>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm leading-relaxed ${isNew ? "text-white font-medium" : "text-white/65"}`}
                        >
                          {n.message}
                        </p>
                        {/* type badge on right */}
                        <span
                          className={`shrink-0 text-[10px] font-['Space_Mono',monospace] uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="flex items-center gap-1.5 text-xs text-white/35">
                          <Clock size={11} />
                          {timeAgo(n.createdAt)}
                        </p>

                        <div className="flex items-center gap-2">
                          {isNew && (
                            <button
                              onClick={() => markAsRead(n._id)}
                              disabled={isBeingMarked}
                              className="flex items-center gap-1.5 text-xs font-semibold text-[#A8E063] hover:text-white border border-[#5C9E31]/30 hover:border-white/25 hover:bg-white/6 px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-50"
                            >
                              {isBeingMarked ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <Check size={11} />
                              )}
                              {isBeingMarked ? "Marking…" : "Mark read"}
                            </button>
                          )}

                          {!isNew && (
                            <span className="flex items-center gap-1 text-xs text-white/25">
                              <Check size={11} /> Read
                            </span>
                          )}

                          {/* delete button — always visible */}
                          <button
                            onClick={() =>
                              setDelete({ id: n._id, message: n.message })
                            }
                            className="grid place-items-center w-7 h-7 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
                            title="Delete notification"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { transform:scale(0); opacity:0; }
          to   { transform:scale(1); opacity:1; }
        }
        @keyframes slideRight {
          from { transform:translateX(40px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
