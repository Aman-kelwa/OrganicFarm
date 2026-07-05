/*
  OrganicFarm – Seller Dashboard
  Theme: deep forest green — #0B1410 base, emerald/moss accents
  Same font system: Playfair Display + Inter + Space Mono
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

/* ─── theme tokens ─── */
const T = {
  bg: "#0B1410",
  bgCard: "#0f1c16",
  bgCard2: "#111f18",
  border: "rgba(52,211,153,0.10)",
  borderHov: "rgba(52,211,153,0.24)",
  glow: "rgba(52,211,153,0.07)",
  accent: "#6ee7b7", // emerald-300
  accentMid: "#10b981", // emerald-500
  accentDim: "#065f46", // emerald-900
  gold: "#fbbf24",
  sky: "#7dd3fc",
};

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
      ? "-translate-x-8"
      : from === "right"
        ? "translate-x-8"
        : "translate-y-6";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out
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
  color,
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
      className={`transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 h-full"
        style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.border = `1px solid ${T.borderHov}`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.border = `1px solid ${T.border}`)
        }
      >
        {/* corner glow */}
        <div
          className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none"
          style={{ background: color + "18", transform: "translate(40%,-40%)" }}
        />
        {/* top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg,transparent,${color}55,transparent)`,
          }}
        />

        <span
          className="inline-grid place-items-center w-11 h-11 rounded-xl mb-4"
          style={{ background: color + "15", color }}
        >
          <Icon size={20} />
        </span>

        <p className="font-['Space_Mono',monospace] text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <p
          className="font-['Playfair_Display',serif] text-4xl font-black"
          style={{ color }}
        >
          {prefix}
          {count.toLocaleString()}
          {suffix}
        </p>
        {note && (
          <p className="text-[11px] text-white/25 mt-2 font-['Space_Mono',monospace]">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── notification pill (live badge) ─── */
function NotifBadge({ count }) {
  if (!count) return null;
  return (
    <span
      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full
      flex items-center justify-center text-[9px] font-bold text-white animate-bounce"
      style={{ background: "#ef4444" }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

/* ─── Notification Card ─── */
function NotifCard({ n, onDismiss, index }) {
  return (
    <Reveal delay={index * 60}>
      <div
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{
          background: T.bgCard2,
          border: `1px solid rgba(52,211,153,0.18)`,
        }}
      >
        {/* left accent bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${T.accent}, transparent)`,
          }}
        />

        {/* dismiss */}
        <button
          onClick={() => onDismiss(index)}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg grid place-items-center
            text-white/20 hover:text-white/60 hover:bg-white/6 transition-all"
        >
          <X size={13} />
        </button>

        {/* header */}
        <div className="flex items-center gap-2.5 mb-4 pl-3">
          <span
            className="inline-grid place-items-center w-8 h-8 rounded-xl"
            style={{ background: "rgba(52,211,153,0.12)", color: T.accent }}
          >
            <BellRing size={14} />
          </span>
          <div>
            <p className="font-['Playfair_Display',serif] font-bold text-base leading-snug text-white/90">
              {n.message}
            </p>
            <p className="font-['Space_Mono',monospace] text-[9px] text-white/25 tracking-wider mt-0.5">
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
              className="rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(52,211,153,0.04)",
                border: "1px solid rgba(52,211,153,0.08)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={11} style={{ color: T.accentMid }} />
                <span className="font-['Space_Mono',monospace] text-[9px] text-white/25 uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p
                className={`text-xs font-semibold truncate ${green ? "text-emerald-400" : "text-white/75"}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* status badge */}
        <div className="flex items-center gap-2 mt-3 pl-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-['Space_Mono',monospace]
            tracking-wider border"
            style={{
              background: "rgba(96,165,250,0.08)",
              borderColor: "rgba(96,165,250,0.2)",
              color: T.sky,
            }}
          >
            <Circle size={6} className="fill-current" />
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
    pending: {
      text: "text-amber-400",
      bg: "bg-amber-400/10   border-amber-400/20",
    },
    confirmed: {
      text: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
    },
    cancelled: {
      text: "text-red-400",
      bg: "bg-red-400/10     border-red-400/20",
    },
  };
  const s = statusColors[order.orderStatus] || statusColors.pending;

  return (
    <Reveal delay={index * 50}>
      <div
        className="group flex items-center justify-between py-4 transition-all duration-200
        hover:bg-white/[0.02] rounded-xl px-3 -mx-3"
        style={{ borderBottom: "1px solid rgba(52,211,153,0.07)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-8 h-8 rounded-xl grid place-items-center flex-shrink-0"
            style={{ background: "rgba(52,211,153,0.08)", color: T.accentMid }}
          >
            <Leaf size={14} />
          </span>
          <div className="min-w-0">
            <h3 className="font-['Playfair_Display',serif] font-bold text-sm text-white/85 truncate">
              {order.listing?.title || "—"}
            </h3>
            <p className="text-[11px] text-white/30 font-['Space_Mono',monospace]">
              Qty: {order.quantity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <p
            className="font-['Space_Mono',monospace] font-bold text-sm"
            style={{ color: T.accent }}
          >
            ₹{order.totalPrice}
          </p>
          <span
            className={`text-[10px] font-['Space_Mono',monospace] tracking-wider uppercase
            px-2.5 py-1 rounded-full border ${s.text} ${s.bg}`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>
    </Reveal>
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

  /* close notif panel on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dismissNotif = (i) =>
    setNotifications((prev) => prev.filter((_, idx) => idx !== i));
  const clearAll = () => setNotifications([]);

  /* ── skeleton ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: T.bg }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl grid place-items-center animate-pulse"
            style={{ background: "rgba(52,211,153,0.12)" }}
          >
            <Leaf size={22} style={{ color: T.accentMid }} />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: T.accentMid,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
          <p className="font-['Space_Mono',monospace] text-[11px] text-white/25 tracking-widest">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white font-['Inter',sans-serif] overflow-x-hidden"
      style={{ background: T.bg }}
    >
      {/* ── deep forest radial wash ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(16,185,129,0.09) 0%, transparent 65%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(52,211,153,0.04) 0%, transparent 60%)",
        }}
      />

      {/* ── noise ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]"
      />

      {/* ══════════════════════════════
          HEADER BAR
      ══════════════════════════════ */}
      <div
        className="sticky top-0 z-40 backdrop-blur-xl px-5 sm:px-8 py-4"
        style={{
          background: `${T.bg}CC`,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* breadcrumb */}
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg grid place-items-center"
              style={{}}
            ></span>

            <span className="text-white/15 mx-1">·</span>
          </div>

          {/* notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs((o) => !o)}
              className={`relative w-10 h-10 rounded-xl grid place-items-center transition-all duration-200
                ${showNotifs ? " text-emerald-400" : " hover:bg-white/10"}`}
            ></button>

            {/* dropdown panel */}
            {showNotifs && (
              <div
                className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden
                animate-[fadeDown_0.2s_ease] z-50"
                style={{
                  background: T.bgCard,
                  border: `1px solid rgba(52,211,153,0.18)`,
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <p className="font-['Playfair_Display',serif] font-bold text-base">
                    Live Notifications
                  </p>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[11px] font-['Space_Mono',monospace] text-white/30 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide p-3 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell size={28} className="mx-auto mb-3 text-white/15" />
                      <p className="text-sm text-white/30">
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 transition-all hover:bg-white/3"
                        style={{
                          background: "rgba(52,211,153,0.04)",
                          border: "1px solid rgba(52,211,153,0.1)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-white/80 leading-snug">
                            {n.message}
                          </p>
                          <button
                            onClick={() => dismissNotif(i)}
                            className="text-white/20 hover:text-white/50 flex-shrink-0 mt-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-medium mt-1">
                          {n.product} · ₹{n.amount}
                        </p>
                        <p className="text-[10px] text-white/25 font-['Space_Mono',monospace] mt-1">
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
      </div>

      {/* ══════════════════════════════
          PAGE HEADER
      ══════════════════════════════ */}
      <section className="relative pt-14 pb-10 px-5 sm:px-8 max-w-7xl mx-auto">
        <div
          className="absolute top-0 left-1/4 w-96 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(16,185,129,0.08)" }}
        />

        <Reveal>
          <p
            className="font-['Space_Mono',monospace] text-[11px] tracking-[0.22em] uppercase mb-4"
            style={{ color: T.accent }}
          >
            Good to see you · Seller
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="font-['Playfair_Display',serif] text-5xl sm:text-6xl font-black leading-[1.05]">
            Your Farm
            <br />
            <span style={{ color: T.accent }}>Overview</span>
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-sm text-white/30 mt-4 max-w-md leading-relaxed">
            Real-time stats, live order notifications and your recent activity —
            all in one place.
          </p>
        </Reveal>
      </section>

      {/* ══════════════════════════════
          STAT CARDS
      ══════════════════════════════ */}
      <section className="px-5 sm:px-8 max-w-7xl mx-auto mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Sprout}
            label="Total Listings"
            value={stats.totalListings}
            color={T.accent}
            delay={0}
            note="Active on marketplace"
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.totalOrders}
            color={T.sky}
            delay={80}
            note="All time"
          />
          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={stats.totalRevenue}
            color="#86efac"
            prefix="₹"
            delay={160}
            note="Net earnings"
          />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.pendingOrders}
            color={T.gold}
            delay={240}
            note="Awaiting action"
          />
        </div>
      </section>

      {/* ══════════════════════════════
          LIVE NOTIFICATIONS (inline)
      ══════════════════════════════ */}
      {notifications.length > 0 && (
        <section className="px-5 sm:px-8 max-w-7xl mx-auto mb-10">
          <Reveal>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl grid place-items-center"
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    color: T.accentMid,
                  }}
                >
                  <BellRing size={16} />
                </span>
                <div>
                  <h2 className="font-['Playfair_Display',serif] text-2xl font-bold">
                    Live Notifications
                  </h2>
                  <p className="font-['Space_Mono',monospace] text-[10px] text-white/25 uppercase tracking-wider">
                    {notifications.length} new order
                    {notifications.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {/* live pulse dot */}
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px]
                  font-['Space_Mono',monospace] tracking-wider"
                  style={{
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.2)",
                    color: T.accent,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-white/25 hover:text-red-400 font-['Space_Mono',monospace] transition-colors"
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
          RECENT ORDERS TABLE
      ══════════════════════════════ */}
      <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-16">
        <Reveal>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
          >
            {/* top shimmer */}
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg,transparent,${T.accentMid}55,transparent)`,
              }}
            />

            {/* header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-5"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl grid place-items-center"
                  style={{
                    background: "rgba(52,211,153,0.10)",
                    color: T.accentMid,
                  }}
                >
                  <ClipboardList size={16} />
                </span>
                <div>
                  <h2 className="font-['Playfair_Display',serif] text-2xl font-bold">
                    Recent Orders
                  </h2>
                  <p className="font-['Space_Mono',monospace] text-[10px] text-white/25 uppercase tracking-wider mt-0.5">
                    Latest activity
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-['Space_Mono',monospace]"
                style={{ color: T.accent }}
              >
                <TrendingUp size={13} />
                {stats.recentOrders.length} orders
              </div>
            </div>

            {/* rows */}
            <div className="px-6 pb-6 pt-2">
              {stats.recentOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4"
                    style={{
                      background: "rgba(52,211,153,0.07)",
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <ShoppingBag size={22} className="text-white/20" />
                  </div>
                  <p className="font-['Playfair_Display',serif] text-xl font-bold text-white/50 mb-1">
                    No orders yet
                  </p>
                  <p className="text-sm text-white/25">
                    Orders from buyers will appear here.
                  </p>
                </div>
              ) : (
                stats.recentOrders.map((order, i) => (
                  <RecentOrderRow key={order._id} order={order} index={i} />
                ))
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wiggle   { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
