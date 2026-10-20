/*
  OrganicFarm – Notifications (Design System v2: light & simple)
  Same tokens and patterns as the other app pages:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
*/

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

/* ── shared style primitives (same as other pages) ── */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F8F4]";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnOutline = `${btn} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const btnSoft = `${btn} bg-[#EAF4E6] text-[#256628] hover:bg-[#DCEED6]`;
const card = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";

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
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── notification type config ── */
const TYPE_META = {
  order: {
    icon: ShoppingBag,
    color: "text-amber-800",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    label: "Order",
  },
  payment: {
    icon: CreditCard,
    color: "text-emerald-800",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-600",
    label: "Payment",
  },
  review: {
    icon: Star,
    color: "text-indigo-800",
    bg: "bg-indigo-50 border-indigo-200",
    dot: "bg-indigo-500",
    label: "Review",
  },
  system: {
    icon: Info,
    color: "text-sky-800",
    bg: "bg-sky-50 border-sky-200",
    dot: "bg-sky-500",
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
    <div
      className={`flex gap-4 p-5 ${card} animate-pulse motion-reduce:animate-none`}
      aria-hidden="true"
    >
      <div className="w-11 h-11 rounded-xl bg-[#E9EDE6] shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-[#E9EDE6] rounded-full w-3/4" />
        <div className="h-3 bg-[#EEF1EB] rounded-full w-1/2" />
        <div className="h-3 bg-[#EEF1EB] rounded-full w-1/3" />
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

  /* ── close delete modal with Escape ── */
  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDelete(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteTarget]);

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
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* ── toast ── */}
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          className={`fixed top-20 right-5 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border bg-white text-sm font-semibold shadow-lg animate-[slideRight_0.3s_ease-out] motion-reduce:animate-none ${
            toast.ok
              ? "border-[#2E7D32]/40 text-[#256628]"
              : "border-red-200 text-red-700"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${toast.ok ? "bg-[#2E7D32]" : "bg-red-500"}`}
          />
          {toast.msg}
        </div>
      )}

      {/* ── delete confirm modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDelete(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-notif-title"
            className="relative w-full max-w-md bg-white border border-[#E4E8E1] rounded-2xl p-6 sm:p-7 shadow-xl animate-[popIn_0.2s_ease-out] motion-reduce:animate-none"
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-red-50 border border-red-200 shrink-0">
                <AlertTriangle
                  size={22}
                  className="text-red-600"
                  aria-hidden="true"
                />
              </span>
              <div>
                <h3 id="delete-notif-title" className="text-lg font-semibold">
                  Delete notification?
                </h3>
                <p className="text-sm text-[#5B6559] mt-0.5">
                  This cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-[#5B6559] bg-[#F6F8F4] border border-[#E4E8E1] rounded-xl px-4 py-3 mb-6 line-clamp-2">
              "{deleteTarget.message}"
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDelete(null)}
                className={`${btnOutline} flex-1`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteNotification}
                className={`${btn} flex-1 bg-red-600 text-white hover:bg-red-700`}
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
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-[#2E7D32] mb-1">
                Activity
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                Notifications
                {/* live ping icon */}
                <span
                  className={`relative inline-flex transition-transform duration-300 motion-reduce:transition-none ${newPing ? "scale-125" : "scale-100"}`}
                >
                  <Bell
                    size={28}
                    aria-hidden="true"
                    className={`transition-colors duration-300 ${newPing ? "text-[#2E7D32]" : "text-[#7A8576]"}`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-[#2E7D32] border-2 border-[#F6F8F4] text-[10px] font-bold text-white animate-[popIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              </h1>
              {!loading && (
                <p className="mt-2 text-sm text-[#5B6559]" aria-live="polite">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingAll}
                className={`${btnSoft} shrink-0 mt-6 disabled:opacity-60`}
              >
                {markingAll ? (
                  <Loader2
                    size={15}
                    className="animate-spin motion-reduce:animate-none"
                  />
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
          <div
            className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide"
            role="group"
            aria-label="Filter notifications"
          >
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
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${focusRing} ${
                    isActive
                      ? "bg-[#2E7D32] text-white"
                      : "bg-white text-[#5B6559] border border-[#D5DBD0] hover:border-[#2E7D32] hover:text-[#2E7D32]"
                  }`}
                >
                  {meta && <meta.icon size={13} aria-hidden="true" />}
                  {f === "All"
                    ? "All"
                    : f === "Unread"
                      ? "Unread"
                      : (meta?.label ?? f)}
                  {count > 0 && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-[#F6F8F4] text-[#5B6559]"
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
          <div
            className="space-y-3"
            role="status"
            aria-label="Loading notifications"
          >
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
            <div
              className={`${card} flex flex-col items-center justify-center py-20 px-6 text-center`}
            >
              <span className="grid place-items-center w-16 h-16 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-5">
                <BellOff size={28} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold mb-2">All quiet out here</h2>
              <p className="text-[#5B6559] max-w-xs text-sm leading-relaxed">
                Order updates, payment confirmations and review alerts will show
                up here in real time.
              </p>
            </div>
          </Reveal>
        )}

        {/* ── NO FILTERED RESULTS ── */}
        {!loading && notifications.length > 0 && visible.length === 0 && (
          <Reveal>
            <div
              className={`${card} flex flex-col items-center py-16 px-6 text-center`}
            >
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#F6F8F4] text-[#7A8576] mb-4">
                <Filter size={24} aria-hidden="true" />
              </span>
              <p className="font-semibold mb-1">
                No {filter.toLowerCase()} notifications
              </p>
              <button
                type="button"
                onClick={() => setFilter("All")}
                className={`${btnOutline} mt-5`}
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
                <Reveal key={n._id} delay={Math.min(i, 5) * 45}>
                  <div
                    className={`group relative flex gap-4 p-5 rounded-2xl border transition-colors duration-200 ${
                      isNew
                        ? "bg-white border-[#D5DBD0] shadow-sm hover:border-[#2E7D32]/40"
                        : "bg-white/70 border-[#E4E8E1] hover:bg-white"
                    }`}
                  >
                    {/* unread left bar */}
                    {isNew && (
                      <div
                        aria-hidden="true"
                        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#2E7D32]"
                      />
                    )}

                    {/* icon */}
                    <span
                      className={`grid place-items-center w-11 h-11 rounded-xl border shrink-0 ${meta.bg} ${meta.color}`}
                    >
                      <Icon size={19} aria-hidden="true" />
                    </span>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm leading-relaxed ${isNew ? "text-[#1F2A1C] font-medium" : "text-[#5B6559]"}`}
                        >
                          {n.message}
                        </p>
                        {/* type badge on right */}
                        <span
                          className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3">
                        <p className="flex items-center gap-1.5 text-xs text-[#5B6559]">
                          <Clock size={12} aria-hidden="true" />
                          {timeAgo(n.createdAt)}
                        </p>

                        <div className="flex items-center gap-2">
                          {isNew && (
                            <button
                              type="button"
                              onClick={() => markAsRead(n._id)}
                              disabled={isBeingMarked}
                              className={`flex items-center gap-1.5 text-xs font-semibold text-[#256628] bg-[#EAF4E6] hover:bg-[#DCEED6] px-3 h-8 rounded-full transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 ${focusRing}`}
                            >
                              {isBeingMarked ? (
                                <Loader2
                                  size={11}
                                  className="animate-spin motion-reduce:animate-none"
                                />
                              ) : (
                                <Check size={11} />
                              )}
                              {isBeingMarked ? "Marking…" : "Mark read"}
                            </button>
                          )}

                          {!isNew && (
                            <span className="flex items-center gap-1 text-xs text-[#7A8576]">
                              <Check size={11} aria-hidden="true" /> Read
                            </span>
                          )}

                          {/* delete button — always visible */}
                          <button
                            type="button"
                            onClick={() =>
                              setDelete({ id: n._id, message: n.message })
                            }
                            aria-label="Delete notification"
                            title="Delete notification"
                            className={`grid place-items-center w-8 h-8 rounded-lg text-[#7A8576] hover:text-red-600 hover:bg-red-50 transition-colors duration-200 active:scale-[0.98] ${focusRing}`}
                          >
                            <Trash2 size={14} />
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
          from { transform:scale(0.9); opacity:0; }
          to   { transform:scale(1);   opacity:1; }
        }
        @keyframes slideRight {
          from { transform:translateX(24px); opacity:0; }
          to   { transform:translateX(0);    opacity:1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
