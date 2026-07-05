import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Package,
  Tractor,
  Star,
  Bell,
  RefreshCw,
  ChevronRight,
  ShoppingCart,
  Calendar,
  Loader2,
  XCircle,
  Truck,
  PlayCircle,
} from "lucide-react";
import api from "../services/api";

/* ─── reveal on scroll ─── */
function useReveal(threshold = 0.08) {
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
      { threshold },
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
      className={`transition-all duration-700 ease-out
        ${v ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.98]"}
        ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── animated count-up ─── */
function CountUp({ target, prefix = "", suffix = "", duration = 1400 }) {
  const [val, setVal] = useState(0);
  const [ref, v] = useReveal();
  useEffect(() => {
    if (!v) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [v, target, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ─── order status config ─── */
const ORDER_STATUS = {
  pending: {
    color: "text-amber-400",
    bg: "bg-amber-400/12  border-amber-400/30",
    icon: Clock,
  },
  confirmed: {
    color: "text-sky-400",
    bg: "bg-sky-400/12    border-sky-400/30",
    icon: CheckCircle2,
  },
  shipped: {
    color: "text-purple-400",
    bg: "bg-purple-400/12 border-purple-400/30",
    icon: Truck,
  },
  completed: {
    color: "text-[#A8E063]",
    bg: "bg-[#5C9E31]/13  border-[#5C9E31]/32",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "text-red-400",
    bg: "bg-red-400/12    border-red-400/30",
    icon: XCircle,
  },
};
const getOrderMeta = (s) => ORDER_STATUS[s] ?? ORDER_STATUS.pending;

/* ─── rental status config ─── */
const RENTAL_STATUS = {
  pending: {
    color: "text-amber-400",
    bg: "bg-amber-400/12  border-amber-400/30",
    icon: Clock,
  },
  active: {
    color: "text-orange-400",
    bg: "bg-orange-400/12 border-orange-400/30",
    icon: PlayCircle,
  },
  completed: {
    color: "text-[#A8E063]",
    bg: "bg-[#5C9E31]/13  border-[#5C9E31]/32",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "text-red-400",
    bg: "bg-red-400/12    border-red-400/30",
    icon: XCircle,
  },
};
const getRentalMeta = (s) => RENTAL_STATUS[s] ?? RENTAL_STATUS.pending;

/* ─── quick link cards ─── */
const QUICK_LINKS = [
  {
    label: "Browse Market",
    to: "/listings",
    icon: ShoppingBag,
    color: "from-[#1a3d12] to-[#0d2008]",
    border: "border-[#2d5c1e]",
  },
  {
    label: "My Orders",
    to: "/buyer-orders",
    icon: Package,
    color: "from-[#1a2e3d] to-[#0d1820]",
    border: "border-[#1e3a52]",
  },
  {
    label: "My Rentals",
    to: "/my-rentals",
    icon: Tractor,
    color: "from-[#2e1a0d] to-[#1a0d06]",
    border: "border-[#52321e]",
  },
  {
    label: "Cart",
    to: "/cart",
    icon: ShoppingCart,
    color: "from-[#2a1a3d] to-[#150d20]",
    border: "border-[#42285c]",
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: Bell,
    color: "from-[#1a1a0d] to-[#0d0d06]",
    border: "border-[#3a3a1e]",
  },
  {
    label: "Reviews",
    to: "/listings",
    icon: Star,
    color: "from-[#3d1a1a] to-[#200d0d]",
    border: "border-[#5c2828]",
  },
];

/* ════════════════════════════════════════════════════════════ */
export default function BuyerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefresh] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  /* ── fetch (unchanged logic) ── */
  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefresh(true);
    else setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/dashboard/buyer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ── greeting ── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* ── stat cards config — orders + rentals, restored from original API data ── */
  const STAT_CARDS = stats
    ? [
        {
          label: "Total Orders",
          value: stats.totalOrders,
          prefix: "",
          icon: ShoppingBag,
          gradient: "from-[#0f2a0a] via-[#0d1f08] to-[#060A06]",
          border: "border-[#1e4012]",
          glow: "shadow-[0_0_30px_rgba(92,158,49,0.12)]",
          valueColor: "text-white",
          iconBg: "bg-[#5C9E31]/20 text-[#A8E063]",
        },
        {
          label: "Total Rentals",
          value: stats.totalRentals,
          prefix: "",
          icon: Tractor,
          gradient: "from-[#2e1a0d] via-[#1a1008] to-[#060A06]",
          border: "border-[#52321e]",
          glow: "shadow-[0_0_30px_rgba(217,119,6,0.10)]",
          valueColor: "text-orange-400",
          iconBg: "bg-orange-400/15 text-orange-400",
        },
        {
          label: "Purchase Amount",
          value: stats.totalSpent,
          prefix: "₹",
          icon: IndianRupee,
          gradient: "from-[#0a1f2a] via-[#080f1a] to-[#060A06]",
          border: "border-[#124030]",
          glow: "shadow-[0_0_30px_rgba(52,211,153,0.08)]",
          valueColor: "text-[#A8E063]",
          iconBg: "bg-emerald-500/15 text-emerald-400",
        },
        {
          label: "Rental Amount",
          value: stats.totalRentalSpent,
          prefix: "₹",
          icon: IndianRupee,
          gradient: "from-[#1f0a2a] via-[#12081a] to-[#060A06]",
          border: "border-[#3a1240]",
          glow: "shadow-[0_0_30px_rgba(168,85,247,0.10)]",
          valueColor: "text-purple-400",
          iconBg: "bg-purple-400/15 text-purple-400",
        },
        {
          label: "Pending Orders",
          value: stats.pendingOrders,
          prefix: "",
          icon: Clock,
          gradient: "from-[#2a1f0a] via-[#1a1208] to-[#060A06]",
          border: "border-[#40300a]",
          glow: "shadow-[0_0_30px_rgba(251,191,36,0.08)]",
          valueColor: "text-amber-400",
          iconBg: "bg-amber-400/15 text-amber-400",
        },
        {
          label: "Active Rentals",
          value: stats.activeRentals,
          prefix: "",
          icon: PlayCircle,
          gradient: "from-[#2a140a] via-[#1a0d08] to-[#060A06]",
          border: "border-[#402210]",
          glow: "shadow-[0_0_30px_rgba(251,146,60,0.10)]",
          valueColor: "text-orange-400",
          iconBg: "bg-orange-400/15 text-orange-400",
        },
        {
          label: "Completed Orders",
          value: stats.completedOrders,
          prefix: "",
          icon: CheckCircle2,
          gradient: "from-[#0a102a] via-[#080a1a] to-[#060A06]",
          border: "border-[#101a40]",
          glow: "shadow-[0_0_30px_rgba(96,165,250,0.08)]",
          valueColor: "text-sky-400",
          iconBg: "bg-sky-400/15 text-sky-400",
        },
        {
          label: "Completed Rentals",
          value: stats.completedRentals,
          prefix: "",
          icon: CheckCircle2,
          gradient: "from-[#0f2a0a] via-[#0d1f08] to-[#060A06]",
          border: "border-[#1e4012]",
          glow: "shadow-[0_0_30px_rgba(92,158,49,0.12)]",
          valueColor: "text-[#A8E063]",
          iconBg: "bg-[#5C9E31]/20 text-[#A8E063]",
        },
      ]
    : [];

  /* ════════════════════ LOADING SKELETON ════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060A06] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#5C9E31]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5C9E31] animate-spin" />
          </div>
          <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  /* ════════════════════ MAIN RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-[#060A06] text-white font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* ── ambient background orbs ── */}
      <div
        aria-hidden
        className="fixed top-0 left-0 w-[700px] h-[700px] rounded-full bg-[#0d2208]/70 blur-[140px] pointer-events-none -translate-x-1/3 -translate-y-1/3"
      />
      <div
        aria-hidden
        className="fixed top-1/2 right-0  w-[500px] h-[500px] rounded-full bg-[#071a04]/80 blur-[120px] pointer-events-none translate-x-1/3"
      />
      <div
        aria-hidden
        className="fixed bottom-0 left-1/2 w-[400px] h-[400px] rounded-full bg-[#051503]/60 blur-[100px] pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-24">
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-12">
            <div>
              <p className="font-['Space_Mono',monospace] text-xs text-[#4a9e28] tracking-widest uppercase mb-1">
                {greeting} 🌱
              </p>
              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold leading-tight">
                {user?.name?.split(" ")[0] ?? "Buyer"}'s
                <br />
                <span className="text-[#A8E063]">Dashboard</span>
              </h1>
              <p className="text-white/35 text-sm mt-3">
                Here's everything happening with your purchases and rentals
                today.
              </p>
            </div>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0f2a0a] border border-[#2d5c1e]
                text-[#A8E063] hover:bg-[#1a3d12] text-sm font-semibold transition-all active:scale-95
                disabled:opacity-50 w-fit self-start sm:self-center"
            >
              {refreshing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              Refresh
            </button>
          </div>
        </Reveal>

        {/* ── STAT CARDS (orders + rentals, 2 rows of 4) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STAT_CARDS.map(
            (
              {
                label,
                value,
                prefix,
                icon: Icon,
                gradient,
                border,
                glow,
                valueColor,
                iconBg,
              },
              i,
            ) => (
              <Reveal key={label} delay={i * 60}>
                <div
                  className={`group relative rounded-2xl bg-gradient-to-br ${gradient} border ${border} ${glow}
                p-6 hover:scale-[1.02] hover:brightness-110 transition-all duration-300 overflow-hidden`}
                >
                  {/* dot grid texture */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.04]
                  bg-[radial-gradient(circle_at_1.5px_1.5px,#fff_1px,transparent_0)]
                  bg-[length:20px_20px]"
                  />
                  <div className="relative">
                    <span
                      className={`inline-grid place-items-center w-10 h-10 rounded-xl ${iconBg} mb-4`}
                    >
                      <Icon size={19} />
                    </span>
                    <p className="text-xs text-white/40 font-['Space_Mono',monospace] uppercase tracking-wider mb-2">
                      {label}
                    </p>
                    <p
                      className={`font-['Playfair_Display',serif] text-3xl sm:text-4xl font-black ${valueColor}`}
                    >
                      <CountUp
                        target={typeof value === "number" ? value : 0}
                        prefix={prefix}
                      />
                    </p>
                  </div>
                </div>
              </Reveal>
            ),
          )}
        </div>

        {/* ── MAIN GRID: recent orders + summary sidebar ── */}
        <div className="grid lg:grid-cols-3 gap-5 mb-12">
          {/* recent orders — spans 2 cols */}
          <Reveal delay={60} className="lg:col-span-2">
            <div
              className="h-full rounded-2xl bg-[#080f08] border border-[#162412]
              shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* card header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#162412]">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31]/15 text-[#A8E063]">
                    <Package size={17} />
                  </span>
                  <h2 className="font-['Playfair_Display',serif] text-xl font-bold">
                    Recent Purchases
                  </h2>
                </div>
                <Link
                  to="/buyer-orders"
                  className="flex items-center gap-1.5 text-xs text-[#A8E063] hover:text-white
                    border border-[#5C9E31]/25 hover:border-white/25 px-3 py-1.5 rounded-full
                    transition-all font-semibold"
                >
                  View all <ChevronRight size={13} />
                </Link>
              </div>

              {/* order list */}
              <div className="divide-y divide-[#0f1f0d]">
                {!stats?.recentOrders?.length ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <ShoppingBag size={36} className="text-white/10 mb-3" />
                    <p className="text-white/35 text-sm">No orders yet</p>
                    <Link
                      to="/listings"
                      className="mt-5 flex items-center gap-1.5 text-xs text-[#A8E063] border border-[#5C9E31]/30
                        px-4 py-2 rounded-full hover:bg-[#5C9E31]/10 transition-all"
                    >
                      Browse market <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  stats.recentOrders.map((order) => {
                    const meta = getOrderMeta(order.orderStatus);
                    const StatusIcon = meta.icon;
                    return (
                      <div
                        key={order._id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-colors group"
                      >
                        {/* image thumb */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/8">
                          {order.listing?.image ? (
                            <img
                              src={order.listing.image}
                              alt={order.listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center">
                              <Package size={18} className="text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {order.listing?.title ?? "Deleted listing"}
                          </p>
                          <p className="text-xs text-white/35 mt-0.5">
                            Qty: {order.quantity} ·{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                        </div>

                        {/* price + status */}
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#A8E063] text-sm">
                            ₹{order.totalPrice?.toLocaleString("en-IN")}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold
                            font-['Space_Mono',monospace] uppercase tracking-wider mt-1.5
                            px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}
                          >
                            <StatusIcon size={9} />
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Reveal>

          {/* spending summary sidebar — now includes rental spend */}
          <Reveal delay={120}>
            <div
              className="h-full rounded-2xl bg-gradient-to-b from-[#0f2a0a] to-[#080f08]
              border border-[#1e4012] shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31]/20 text-[#A8E063]">
                  <TrendingUp size={17} />
                </span>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold">
                  Summary
                </h2>
              </div>

              {/* big spend numbers — purchases + rentals side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#5C9E31]/8 border border-[#5C9E31]/20 p-4 text-center">
                  <p className="font-['Space_Mono',monospace] text-[10px] text-white/40 uppercase tracking-widest mb-2">
                    Purchases
                  </p>
                  <p className="font-['Playfair_Display',serif] text-2xl font-black text-[#A8E063]">
                    <CountUp target={stats?.totalSpent ?? 0} prefix="₹" />
                  </p>
                </div>
                <div className="rounded-xl bg-purple-400/8 border border-purple-400/20 p-4 text-center">
                  <p className="font-['Space_Mono',monospace] text-[10px] text-white/40 uppercase tracking-widest mb-2">
                    Rentals
                  </p>
                  <p className="font-['Playfair_Display',serif] text-2xl font-black text-purple-400">
                    <CountUp target={stats?.totalRentalSpent ?? 0} prefix="₹" />
                  </p>
                </div>
              </div>

              {/* breakdown */}
              <div className="space-y-3">
                {[
                  {
                    label: "Orders placed",
                    value: stats?.totalOrders ?? 0,
                    color: "text-white",
                  },
                  {
                    label: "Rentals booked",
                    value: stats?.totalRentals ?? 0,
                    color: "text-orange-400",
                  },
                  {
                    label: "Pending orders",
                    value: stats?.pendingOrders ?? 0,
                    color: "text-amber-400",
                  },
                  {
                    label: "Active rentals",
                    value: stats?.activeRentals ?? 0,
                    color: "text-orange-400",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-white/45">{label}</span>
                    <span
                      className={`font-bold text-lg font-['Playfair_Display',serif] ${color}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* mini CTA */}
              <Link
                to="/listings"
                className="flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-[#5C9E31] hover:bg-[#4e8a28] text-white font-semibold text-sm
                  transition-all active:scale-95 shadow-[0_0_20px_rgba(92,158,49,0.3)]
                  hover:shadow-[0_0_30px_rgba(92,158,49,0.45)] mt-auto"
              >
                Shop Now <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ── RECENT RENTALS ── */}
        <Reveal delay={40}>
          <div
            className="rounded-2xl bg-[#080f08] border border-[#162412]
            shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden mb-12"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#162412]">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-orange-400/15 text-orange-400">
                  <Tractor size={17} />
                </span>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold">
                  Recent Rentals
                </h2>
              </div>
              <Link
                to="/my-rentals"
                className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-white
                  border border-orange-400/25 hover:border-white/25 px-3 py-1.5 rounded-full
                  transition-all font-semibold"
              >
                View all <ChevronRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-[#0f1f0d]">
              {!stats?.recentRentals?.length ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Tractor size={36} className="text-white/10 mb-3" />
                  <p className="text-white/35 text-sm">No rentals yet</p>
                  <Link
                    to="/listings"
                    className="mt-5 flex items-center gap-1.5 text-xs text-orange-400 border border-orange-400/30
                      px-4 py-2 rounded-full hover:bg-orange-400/10 transition-all"
                  >
                    Browse equipment <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                stats.recentRentals.map((rental) => {
                  const meta = getRentalMeta(rental.rentalStatus);
                  const StatusIcon = meta.icon;
                  return (
                    <div
                      key={rental._id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/8 grid place-items-center">
                        <Tractor size={18} className="text-white/30" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {rental.listing?.title ?? "Deleted listing"}
                        </p>
                        <p className="text-xs text-white/35 mt-0.5">
                          {new Date(rental.startDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" },
                          )}
                          {" – "}
                          {new Date(rental.endDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" },
                          )}
                          {" · "}
                          {rental.totalDays} day
                          {rental.totalDays === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-orange-400 text-sm">
                          ₹{rental.totalRent?.toLocaleString("en-IN")}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold
                          font-['Space_Mono',monospace] uppercase tracking-wider mt-1.5
                          px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}
                        >
                          <StatusIcon size={9} />
                          {rental.rentalStatus}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Reveal>

        {/* ── QUICK LINKS GRID ── */}
        <Reveal delay={80}>
          <div className="mb-6">
            <p className="font-['Space_Mono',monospace] text-xs text-white/30 tracking-widest uppercase mb-5">
              Quick Access
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_LINKS.map(
                ({ label, to, icon: Icon, color, border }, i) => (
                  <Reveal key={label} delay={i * 50}>
                    <Link
                      to={to}
                      className={`group flex flex-col items-center gap-3 p-5 rounded-2xl
                      bg-gradient-to-br ${color} border ${border}
                      hover:brightness-125 hover:scale-[1.04] hover:-translate-y-0.5
                      transition-all duration-200 active:scale-95`}
                    >
                      <span
                        className="grid place-items-center w-11 h-11 rounded-xl bg-white/8
                      group-hover:bg-white/14 transition-colors"
                      >
                        <Icon
                          size={20}
                          className="text-white/65 group-hover:text-white transition-colors"
                        />
                      </span>
                      <span
                        className="text-xs font-semibold text-white/55 group-hover:text-white/90
                      transition-colors text-center leading-tight"
                      >
                        {label}
                      </span>
                    </Link>
                  </Reveal>
                ),
              )}
            </div>
          </div>
        </Reveal>

        {/* ── ACTIVITY TIMELINE (orders + rentals merged, sorted by date) ── */}
        {(stats?.recentOrders?.length > 0 ||
          stats?.recentRentals?.length > 0) && (
          <Reveal delay={100}>
            <div className="rounded-2xl bg-[#080f08] border border-[#162412] p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31]/15 text-[#A8E063]">
                  <Calendar size={16} />
                </span>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold">
                  Activity Timeline
                </h2>
              </div>

              <div className="relative">
                <div className="absolute left-[17px] top-0 bottom-0 w-px bg-gradient-to-b from-[#5C9E31]/40 via-[#5C9E31]/20 to-transparent" />

                <div className="space-y-5">
                  {[
                    ...(stats.recentOrders ?? []).map((o) => ({
                      ...o,
                      __kind: "order",
                    })),
                    ...(stats.recentRentals ?? []).map((r) => ({
                      ...r,
                      __kind: "rental",
                    })),
                  ]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt ?? b.startDate) -
                        new Date(a.createdAt ?? a.startDate),
                    )
                    .map((item) => {
                      const isOrder = item.__kind === "order";
                      const meta = isOrder
                        ? getOrderMeta(item.orderStatus)
                        : getRentalMeta(item.rentalStatus);
                      const StatusIcon = meta.icon;
                      const amount = isOrder ? item.totalPrice : item.totalRent;
                      const status = isOrder
                        ? item.orderStatus
                        : item.rentalStatus;
                      const dateVal = isOrder ? item.createdAt : item.startDate;
                      return (
                        <div key={item._id} className="flex gap-5 items-start">
                          <div
                            className={`relative z-10 grid place-items-center w-9 h-9 rounded-full border shrink-0 ${meta.bg}`}
                          >
                            <StatusIcon size={14} className={meta.color} />
                          </div>
                          <div className="flex-1 flex items-center justify-between py-1 min-w-0">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate flex items-center gap-2">
                                {item.listing?.title ?? "Deleted listing"}
                                <span
                                  className="text-[9px] font-['Space_Mono',monospace] uppercase tracking-wider
                                  px-1.5 py-0.5 rounded-full border border-white/10 text-white/35"
                                >
                                  {isOrder ? "order" : "rental"}
                                </span>
                              </p>
                              <p className="text-xs text-white/35 mt-0.5">
                                {new Date(dateVal).toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <p
                                className={`font-bold text-sm ${isOrder ? "text-[#A8E063]" : "text-orange-400"}`}
                              >
                                ₹{amount?.toLocaleString("en-IN")}
                              </p>
                              <p
                                className={`text-xs font-semibold mt-0.5 ${meta.color}`}
                              >
                                {status}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
