/*
  OrganicFarm – Seller Dashboard (Design System v2: light & simple)
  Same tokens and patterns as the other app pages:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
  Fonts (index.html): Inter only
*/

import { useEffect, useRef, useState } from "react";
import socket from "../socket";
import api from "../services/api";
import {
  Leaf,
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  Clock,
  IndianRupee,
  Bell,
  BellRing,
  X,
  User,
  Mail,
  Package,
  CreditCard,
  ClipboardList,
  Sprout,
  ArrowUpRight,
  CheckCircle2,
  Circle,
} from "lucide-react";

/* ─── shared style primitives (same as other pages) ─── */
const container = "max-w-7xl mx-auto px-5 sm:px-8";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F8F4]";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const card = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const iconBtn = `relative grid place-items-center w-11 h-11 rounded-xl border border-[#E4E8E1] bg-white text-[#5B6559] hover:bg-[#F6F8F4] hover:text-[#1F2A1C] transition-colors duration-200 ${focusRing}`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── reveal hook ─── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, from = "bottom", className = "" }) {
  const [ref, visible] = useReveal();
  const t =
    from === "left"
      ? "-translate-x-4"
      : from === "right"
        ? "translate-x-4"
        : "translate-y-4";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0
        ${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${t}`} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── count-up ─── */
function useCountUp(target, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    if (prefersReducedMotion()) {
      setVal(target);
      return;
    }
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  delay,
  note,
}) {
  const [ref, visible] = useReveal();
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  const count = useCountUp(num, 1400, visible);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className={`${card} p-5 sm:p-6 h-full`}>
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#EAF4E6] text-[#2E7D32] mb-4">
          <Icon size={20} aria-hidden="true" />
        </span>
        <p className="text-[13px] text-[#5B6559] mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold">
          {prefix}
          {count.toLocaleString()}
          {suffix}
        </p>
        {note && <p className="text-xs text-[#7A8576] mt-2">{note}</p>}
      </div>
    </div>
  );
}

/* ─── notification pill (live badge) ─── */
function NotifBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#2E7D32] border-2 border-[#F6F8F4]">
      {count > 9 ? "9+" : count}
    </span>
  );
}

/* ─── Notification Card ─── */
function NotifCard({ n, onDismiss, index }) {
  return (
    <Reveal delay={Math.min(index, 5) * 60}>
      <div className={`relative ${card} p-5 overflow-hidden`}>
        {/* left accent bar */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#2E7D32]"
        />

        {/* dismiss */}
        <button
          type="button"
          onClick={() => onDismiss(index)}
          aria-label="Dismiss notification"
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg grid place-items-center text-[#7A8576] hover:text-[#1F2A1C] hover:bg-[#F6F8F4] transition-colors duration-200 ${focusRing}`}
        >
          <X size={14} />
        </button>

        {/* header */}
        <div className="flex items-start gap-3 mb-4 pl-3 pr-8">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#EAF4E6] text-[#2E7D32] shrink-0">
            <BellRing size={15} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-base leading-snug">{n.message}</p>
            <p className="text-xs text-[#5B6559] mt-0.5">
              {new Date(n.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-3">
          {[
            { icon: User, label: "Buyer", value: n.buyer?.name },
            { icon: Mail, label: "Email", value: n.buyer?.email },
            { icon: Sprout, label: "Product", value: n.product },
            { icon: Package, label: "Qty", value: n.quantity },
            {
              icon: IndianRupee,
              label: "Amount",
              value: `₹${n.amount}`,
              green: true,
            },
            {
              icon: CreditCard,
              label: "Payment",
              value: n.paymentStatus,
              green: true,
            },
          ].map(({ icon: Icon, label, value, green }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2.5 bg-[#F6F8F4] border border-[#E4E8E1] min-w-0"
            >
              <div className="flex items-center gap-1.5 mb-0.5 text-[#5B6559]">
                <Icon size={12} aria-hidden="true" />
                <span className="text-xs">{label}</span>
              </div>
              <p
                className={`text-sm font-semibold truncate ${green ? "text-[#256628]" : "text-[#1F2A1C]"}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* status badge */}
        <div className="flex items-center gap-2 mt-3 pl-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border bg-sky-50 border-sky-200 text-sky-800">
            <Circle size={6} className="fill-current" aria-hidden="true" />
            {n.orderStatus}
          </span>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Recent Order Row ─── */
function RecentOrderRow({ order, index }) {
  const statusColors = {
    pending: "text-amber-800 bg-amber-50 border-amber-200",
    confirmed: "text-sky-800 bg-sky-50 border-sky-200",
    shipped: "text-indigo-800 bg-indigo-50 border-indigo-200",
    completed: "text-emerald-800 bg-emerald-50 border-emerald-200",
    cancelled: "text-red-700 bg-red-50 border-red-200",
  };
  const s = statusColors[order.orderStatus] || statusColors.pending;

  return (
    <Reveal delay={Math.min(index, 5) * 50}>
      <div className="flex items-center justify-between gap-3 py-4 border-b border-[#E4E8E1] last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-[#EAF4E6] text-[#2E7D32]">
            <Leaf size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {order.listing?.title || "—"}
            </h3>
            <p className="text-xs text-[#5B6559] mt-0.5">
              Qty: {order.quantity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="font-bold text-sm">₹{order.totalPrice}</p>
          <span
            className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full border ${s}`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── loading skeleton ─── */
function DashboardSkeleton() {
  const block = "bg-[#E9EDE6] rounded-xl";
  return (
    <div
      className="min-h-screen bg-[#F6F8F4]"
      role="status"
      aria-label="Loading dashboard"
    >
      <div
        className={`${container} pt-28 pb-20 animate-pulse motion-reduce:animate-none`}
      >
        <div className={`${block} h-4 w-32 mb-3`} />
        <div className={`${block} h-9 w-72 mb-3`} />
        <div className={`${block} h-4 w-96 max-w-full mb-10`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={`${card} p-6`}>
                <div className={`${block} h-11 w-11 mb-4`} />
                <div className={`${block} h-3 w-24 mb-3`} />
                <div className={`${block} h-8 w-20`} />
              </div>
            ))}
        </div>
        <div className={`${card} h-72`} />
      </div>
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/dashboard/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    socket.onAny((event, ...args) => console.log("EVENT:", event, args));
    socket.on("new-order", (data) => {
      setNotifications((prev) => [data, ...prev]);
      fetchDashboard();
    });
    return () => {
      socket.off("new-order");
      socket.offAny();
    };
  }, []);

  /* close notif panel on outside click / Escape */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifs(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const dismissNotif = (i) =>
    setNotifications((prev) => prev.filter((_, idx) => idx !== i));
  const clearAll = () => setNotifications([]);

  /* ── loading ── */
  if (loading) return <DashboardSkeleton />;

  /* ── failed to load (prevents a blank crash when the API call fails) ── */
  if (!stats) {
    return (
      <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif]">
        <div className={`${container} pt-28 pb-20`}>
          <div
            className={`${card} flex flex-col items-center py-20 px-6 text-center`}
          >
            <span className="grid place-items-center w-16 h-16 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-5">
              <LayoutDashboard size={28} aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold mb-2">
              Couldn't load your dashboard
            </h1>
            <p className="text-sm text-[#5B6559] max-w-xs mb-6">
              Something went wrong while fetching your stats. Please try again.
            </p>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                setLoading(true);
                fetchDashboard();
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recentOrders = stats.recentOrders ?? [];

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif] overflow-x-hidden">
      {/* ══════════════════════════════
          PAGE HEADER
      ══════════════════════════════ */}
      <section className={`${container} pt-28 pb-8`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Reveal>
              <p className="text-sm font-semibold text-[#2E7D32] mb-1">
                Seller dashboard
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Your Farm Overview
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-sm text-[#5B6559] mt-2 max-w-md leading-relaxed">
                Real-time stats, live order notifications and your recent
                activity — all in one place.
              </p>
            </Reveal>
          </div>

          {/* notification bell */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifs((o) => !o)}
              aria-label={
                notifications.length
                  ? `Live notifications, ${notifications.length} new`
                  : "Live notifications"
              }
              aria-expanded={showNotifs}
              className={`${iconBtn} ${showNotifs ? "bg-[#EAF4E6] text-[#256628] border-[#2E7D32]/40" : ""}`}
            >
              <Bell size={18} />
              <NotifBadge count={notifications.length} />
            </button>

            {/* dropdown panel */}
            {showNotifs && (
              <div className="absolute top-full right-0 mt-2 w-[min(24rem,calc(100vw-2.5rem))] rounded-2xl bg-white border border-[#E4E8E1] shadow-lg overflow-hidden animate-[fadeDown_0.2s_ease-out] motion-reduce:animate-none z-30">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8E1]">
                  <p className="font-semibold text-base">Live notifications</p>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className={`text-xs font-semibold text-[#5B6559] hover:text-red-600 transition-colors duration-200 rounded ${focusRing}`}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide p-3 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell
                        size={28}
                        className="mx-auto mb-3 text-[#7A8576]"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-[#5B6559]">
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 bg-[#F6F8F4] border border-[#E4E8E1]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug">
                            {n.message}
                          </p>
                          <button
                            type="button"
                            onClick={() => dismissNotif(i)}
                            aria-label="Dismiss notification"
                            className={`text-[#7A8576] hover:text-[#1F2A1C] shrink-0 mt-0.5 rounded ${focusRing}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-[#256628] font-medium mt-1">
                          {n.product} · ₹{n.amount}
                        </p>
                        <p className="text-xs text-[#7A8576] mt-1">
                          {new Date(n.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STAT CARDS
      ══════════════════════════════ */}
      <section className={`${container} mb-10`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Sprout}
            label="Total Listings"
            value={stats.totalListings}
            delay={0}
            note="Active on marketplace"
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.totalOrders}
            delay={70}
            note="All time"
          />
          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={stats.totalRevenue}
            prefix="₹"
            delay={140}
            note="Net earnings"
          />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.pendingOrders}
            delay={210}
            note="Awaiting action"
          />
        </div>
      </section>

      {/* ══════════════════════════════
          LIVE NOTIFICATIONS (inline)
      ══════════════════════════════ */}
      {notifications.length > 0 && (
        <section className={`${container} mb-10`}>
          <Reveal>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
                  <BellRing size={16} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">Live notifications</h2>
                  <p className="text-[13px] text-[#5B6559]">
                    {notifications.length} new order
                    {notifications.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF4E6] text-[#256628]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                  Live
                </span>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className={`text-sm font-semibold text-[#5B6559] hover:text-red-600 transition-colors duration-200 rounded ${focusRing}`}
              >
                Dismiss all
              </button>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4">
            {notifications.map((n, i) => (
              <NotifCard key={i} n={n} onDismiss={dismissNotif} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          RECENT ORDERS
      ══════════════════════════════ */}
      <section className={`${container} pb-20`}>
        <Reveal>
          <div className={`${card} overflow-hidden`}>
            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E8E1]">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
                  <ClipboardList size={17} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Recent orders</h2>
                  <p className="text-[13px] text-[#5B6559]">Latest activity</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#256628]">
                <TrendingUp size={14} aria-hidden="true" />
                {recentOrders.length} orders
              </div>
            </div>

            {/* rows */}
            <div className="px-6 py-2">
              {recentOrders.length === 0 ? (
                <div className="py-14 text-center">
                  <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mx-auto mb-4">
                    <ShoppingBag size={24} aria-hidden="true" />
                  </span>
                  <p className="text-lg font-semibold mb-1">No orders yet</p>
                  <p className="text-sm text-[#5B6559]">
                    Orders from buyers will appear here.
                  </p>
                </div>
              ) : (
                recentOrders.map((order, i) => (
                  <RecentOrderRow key={order._id} order={order} index={i} />
                ))
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
