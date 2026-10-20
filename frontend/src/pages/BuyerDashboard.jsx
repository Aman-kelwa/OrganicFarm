/*
  OrganicFarm – BuyerDashboard (Design System v2: light & simple)
  Same tokens and patterns as BuyerOrders.jsx / MyRentals.jsx:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
*/

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

/* ─── shared style primitives (same as other pages) ─── */
const container = "max-w-7xl mx-auto px-5 sm:px-8";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F8F4]";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const btnOutline = `${btn} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const card = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const linkSoft = `inline-flex items-center gap-1 text-sm font-semibold text-[#2E7D32] hover:text-[#256628] transition-colors duration-200 rounded ${focusRing}`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0
        ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
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
    if (prefersReducedMotion()) {
      setVal(target);
      return;
    }
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
    color: "text-amber-800",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  confirmed: {
    color: "text-sky-800",
    bg: "bg-sky-50 border-sky-200",
    icon: CheckCircle2,
  },
  shipped: {
    color: "text-indigo-800",
    bg: "bg-indigo-50 border-indigo-200",
    icon: Truck,
  },
  completed: {
    color: "text-emerald-800",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};
const getOrderMeta = (s) => ORDER_STATUS[s] ?? ORDER_STATUS.pending;

/* ─── rental status config ─── */
const RENTAL_STATUS = {
  pending: {
    color: "text-amber-800",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  active: {
    color: "text-sky-800",
    bg: "bg-sky-50 border-sky-200",
    icon: PlayCircle,
  },
  completed: {
    color: "text-emerald-800",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};
const getRentalMeta = (s) => RENTAL_STATUS[s] ?? RENTAL_STATUS.pending;

/* ─── quick link cards ─── */
const QUICK_LINKS = [
  { label: "Browse Market", to: "/listings", icon: ShoppingBag },
  { label: "My Orders", to: "/buyer-orders", icon: Package },
  { label: "My Rentals", to: "/my-rentals", icon: Tractor },
  { label: "Cart", to: "/cart", icon: ShoppingCart },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Reviews", to: "/listings", icon: Star },
];

const fmtShort = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/* ─── shared status badge ─── */
function StatusBadge({ meta, label }) {
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold capitalize px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}
    >
      <Icon size={10} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ─── panel header ─── */
function PanelHeader({ icon: Icon, title, to }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E8E1]">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {to && (
        <Link to={to} className={linkSoft}>
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* ─── empty block inside a panel ─── */
function PanelEmpty({ icon: Icon, text, to, cta }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-3">
        <Icon size={24} aria-hidden="true" />
      </span>
      <p className="text-[#5B6559] text-sm">{text}</p>
      <Link to={to} className={`${btnOutline} mt-5 h-10`}>
        {cta} <ArrowRight size={13} />
      </Link>
    </div>
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
        className={`${container} pt-28 pb-24 animate-pulse motion-reduce:animate-none`}
      >
        <div className={`${block} h-4 w-32 mb-3`} />
        <div className={`${block} h-9 w-72 mb-3`} />
        <div className={`${block} h-4 w-96 max-w-full mb-10`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={`${card} p-6`}>
                <div className={`${block} h-10 w-10 mb-4`} />
                <div className={`${block} h-3 w-24 mb-3`} />
                <div className={`${block} h-8 w-20`} />
              </div>
            ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className={`${card} lg:col-span-2 h-80`} />
          <div className={`${card} h-80`} />
        </div>
      </div>
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}

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

  /* ── stat cards config — orders + rentals ── */
  const STAT_CARDS = stats
    ? [
        {
          label: "Total Orders",
          value: stats.totalOrders,
          prefix: "",
          icon: ShoppingBag,
        },
        {
          label: "Total Rentals",
          value: stats.totalRentals,
          prefix: "",
          icon: Tractor,
        },
        {
          label: "Purchase Amount",
          value: stats.totalSpent,
          prefix: "₹",
          icon: IndianRupee,
        },
        {
          label: "Rental Amount",
          value: stats.totalRentalSpent,
          prefix: "₹",
          icon: IndianRupee,
        },
        {
          label: "Pending Orders",
          value: stats.pendingOrders,
          prefix: "",
          icon: Clock,
        },
        {
          label: "Active Rentals",
          value: stats.activeRentals,
          prefix: "",
          icon: PlayCircle,
        },
        {
          label: "Completed Orders",
          value: stats.completedOrders,
          prefix: "",
          icon: CheckCircle2,
        },
        {
          label: "Completed Rentals",
          value: stats.completedRentals,
          prefix: "",
          icon: CheckCircle2,
        },
      ]
    : [];

  /* ════════════════════ LOADING ════════════════════ */
  if (loading) return <DashboardSkeleton />;

  /* ════════════════════ MAIN RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif] overflow-x-hidden">
      <div className={`${container} pt-28 pb-24`}>
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-[#2E7D32] mb-1">
                {greeting}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {user?.name?.split(" ")[0] ?? "Buyer"}'s Dashboard
              </h1>
              <p className="text-[#5B6559] text-sm mt-2">
                Here's everything happening with your purchases and rentals
                today.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className={`${btnOutline} w-fit disabled:opacity-60`}
            >
              {refreshing ? (
                <Loader2
                  size={15}
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <RefreshCw size={15} />
              )}
              Refresh
            </button>
          </div>
        </Reveal>

        {/* ── STAT CARDS (orders + rentals, 2 rows of 4) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map(({ label, value, prefix, icon: Icon }, i) => (
            <Reveal key={label} delay={(i % 4) * 60}>
              <div className={`${card} p-5 sm:p-6 h-full`}>
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#EAF4E6] text-[#2E7D32] mb-4">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <p className="text-[13px] text-[#5B6559] mb-1">{label}</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  <CountUp
                    target={typeof value === "number" ? value : 0}
                    prefix={prefix}
                  />
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── MAIN GRID: recent orders + summary sidebar ── */}
        <div className="grid lg:grid-cols-3 gap-5 mb-10">
          {/* recent orders — spans 2 cols */}
          <Reveal delay={60} className="lg:col-span-2">
            <div className={`h-full ${card} overflow-hidden`}>
              <PanelHeader
                icon={Package}
                title="Recent Purchases"
                to="/buyer-orders"
              />

              <div className="divide-y divide-[#E4E8E1]">
                {!stats?.recentOrders?.length ? (
                  <PanelEmpty
                    icon={ShoppingBag}
                    text="No orders yet"
                    to="/listings"
                    cta="Browse market"
                  />
                ) : (
                  stats.recentOrders.map((order) => {
                    const meta = getOrderMeta(order.orderStatus);
                    return (
                      <div
                        key={order._id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#F6F8F4] transition-colors duration-200 group"
                      >
                        {/* image thumb */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EAF4E6] shrink-0 border border-[#E4E8E1]">
                          {order.listing?.image ? (
                            <img
                              src={order.listing.image}
                              alt={order.listing.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-[#2E7D32]">
                              <Package size={18} aria-hidden="true" />
                            </div>
                          )}
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {order.listing?.title ?? "Deleted listing"}
                          </p>
                          <p className="text-xs text-[#5B6559] mt-0.5">
                            Qty: {order.quantity} · {fmtShort(order.createdAt)}
                          </p>
                        </div>

                        {/* price + status */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <p className="font-bold text-sm">
                            ₹{order.totalPrice?.toLocaleString("en-IN")}
                          </p>
                          <StatusBadge meta={meta} label={order.orderStatus} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Reveal>

          {/* spending summary sidebar */}
          <Reveal delay={120}>
            <div className={`h-full ${card} p-6 flex flex-col gap-6`}>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
                  <TrendingUp size={17} aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold">Summary</h2>
              </div>

              {/* spend numbers — purchases + rentals */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#EAF4E6] p-4 text-center">
                  <p className="text-xs text-[#5B6559] mb-1.5">Purchases</p>
                  <p className="text-xl font-bold text-[#256628]">
                    <CountUp target={stats?.totalSpent ?? 0} prefix="₹" />
                  </p>
                </div>
                <div className="rounded-xl bg-[#F6F8F4] border border-[#E4E8E1] p-4 text-center">
                  <p className="text-xs text-[#5B6559] mb-1.5">Rentals</p>
                  <p className="text-xl font-bold">
                    <CountUp target={stats?.totalRentalSpent ?? 0} prefix="₹" />
                  </p>
                </div>
              </div>

              {/* breakdown */}
              <div>
                {[
                  { label: "Orders placed", value: stats?.totalOrders ?? 0 },
                  { label: "Rentals booked", value: stats?.totalRentals ?? 0 },
                  { label: "Pending orders", value: stats?.pendingOrders ?? 0 },
                  { label: "Active rentals", value: stats?.activeRentals ?? 0 },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3 border-b border-[#E4E8E1] last:border-0"
                  >
                    <span className="text-sm text-[#5B6559]">{label}</span>
                    <span className="font-bold text-base">{value}</span>
                  </div>
                ))}
              </div>

              <Link to="/listings" className={`${btnPrimary} mt-auto`}>
                Shop Now <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ── RECENT RENTALS ── */}
        <Reveal delay={40}>
          <div className={`${card} overflow-hidden mb-10`}>
            <PanelHeader
              icon={Tractor}
              title="Recent Rentals"
              to="/my-rentals"
            />

            <div className="divide-y divide-[#E4E8E1]">
              {!stats?.recentRentals?.length ? (
                <PanelEmpty
                  icon={Tractor}
                  text="No rentals yet"
                  to="/listings"
                  cta="Browse equipment"
                />
              ) : (
                stats.recentRentals.map((rental) => {
                  const meta = getRentalMeta(rental.rentalStatus);
                  return (
                    <div
                      key={rental._id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#F6F8F4] transition-colors duration-200"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#EAF4E6] text-[#2E7D32] shrink-0 border border-[#E4E8E1] grid place-items-center">
                        <Tractor size={18} aria-hidden="true" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {rental.listing?.title ?? "Deleted listing"}
                        </p>
                        <p className="text-xs text-[#5B6559] mt-0.5">
                          {fmtShort(rental.startDate)}
                          {" – "}
                          {fmtShort(rental.endDate)}
                          {" · "}
                          {rental.totalDays} day
                          {rental.totalDays === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <p className="font-bold text-sm">
                          ₹{rental.totalRent?.toLocaleString("en-IN")}
                        </p>
                        <StatusBadge meta={meta} label={rental.rentalStatus} />
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
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Quick access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  className={`group flex flex-col items-center gap-3 p-5 ${card} hover:shadow-md hover:border-[#D5DBD0] transition-shadow duration-200 ${focusRing}`}
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#EAF4E6] text-[#2E7D32] group-hover:bg-[#DCEED6] transition-colors duration-200">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-[#1F2A1C] text-center leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── ACTIVITY TIMELINE (orders + rentals merged, sorted by date) ── */}
        {(stats?.recentOrders?.length > 0 ||
          stats?.recentRentals?.length > 0) && (
          <Reveal delay={100}>
            <div className={`${card} p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#EAF4E6] text-[#2E7D32]">
                  <Calendar size={16} aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold">Activity timeline</h2>
              </div>

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute left-[17px] top-2 bottom-2 w-px bg-[#E4E8E1]"
                />

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
                        <div key={item._id} className="flex gap-4 items-start">
                          <div
                            className={`relative z-10 grid place-items-center w-9 h-9 rounded-full border shrink-0 ${meta.bg} ${meta.color}`}
                          >
                            <StatusIcon size={14} aria-hidden="true" />
                          </div>
                          <div className="flex-1 flex items-center justify-between py-1 min-w-0">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate flex items-center gap-2">
                                <span className="truncate">
                                  {item.listing?.title ?? "Deleted listing"}
                                </span>
                                <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F6F8F4] border border-[#E4E8E1] text-[#5B6559]">
                                  {isOrder ? "Order" : "Rental"}
                                </span>
                              </p>
                              <p className="text-xs text-[#5B6559] mt-0.5">
                                {new Date(dateVal).toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <p className="font-bold text-sm">
                                ₹{amount?.toLocaleString("en-IN")}
                              </p>
                              <p
                                className={`text-xs font-semibold capitalize mt-0.5 ${meta.color}`}
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
    </div>
  );
}
