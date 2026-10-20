/*
  OrganicFarm – BuyerOrders (Design System v2: light & simple)
  App pages (not marketing pages) use a soft page background with white cards:
  page #F6F8F4 · card #FFFFFF · soft green #EAF4E6 · border #E4E8E1 (strong #D5DBD0)
  text #1F2A1C · muted #5B6559 · subtle #7A8576 · primary #2E7D32 (hover #256628)
*/

import { useEffect, useState, useRef } from "react";
import {
  Package,
  User,
  Mail,
  IndianRupee,
  Hash,
  Calendar,
  CreditCard,
  ShoppingBag,
  Search,
  Filter,
  ChevronDown,
  X,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Truck,
} from "lucide-react";
import api from "../services/api";

/* ── shared style primitives (same as Home / Navbar) ── */
const container = "max-w-7xl mx-auto px-5 sm:px-8";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F8F4]";
const btn = `inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${focusRing}`;
const btnPrimary = `${btn} bg-[#2E7D32] text-white hover:bg-[#256628]`;
const btnOutline = `${btn} border border-[#D5DBD0] bg-white text-[#1F2A1C] hover:bg-[#F6F8F4]`;
const card = "rounded-2xl border border-[#E4E8E1] bg-white shadow-sm";
const field =
  "bg-white border border-[#D5DBD0] rounded-xl h-11 text-[14px] text-[#1F2A1C] outline-none transition-colors duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20";

/* ── reveal ── */
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
      { threshold: 0.06 },
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
        ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── status config ── */
const ORDER_STATUS = {
  pending: {
    label: "Pending",
    color: "text-amber-800",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-sky-800",
    bg: "bg-sky-50 border-sky-200",
    dot: "bg-sky-500",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-800",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-600",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-800",
    bg: "bg-indigo-50 border-indigo-200",
    dot: "bg-indigo-500",
    icon: Truck,
  },
};
const getOrderStatus = (s) => ORDER_STATUS[s] ?? ORDER_STATUS.pending;

const PAYMENT_COLOR = {
  paid: "text-emerald-800 bg-emerald-50 border-emerald-200",
  pending: "text-amber-800 bg-amber-50 border-amber-200",
  failed: "text-red-700 bg-red-50 border-red-200",
};

/* ── skeleton ── */
function Skeleton() {
  return (
    <div
      className={`${card} overflow-hidden animate-pulse motion-reduce:animate-none`}
      aria-hidden="true"
    >
      <div className="h-44 bg-[#E9EDE6]" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-[#E9EDE6] rounded-full w-3/4" />
        <div className="h-3 bg-[#EEF1EB] rounded-full w-1/2" />
        <div className="h-3 bg-[#EEF1EB] rounded-full w-2/3" />
        <div className="h-20 bg-[#F3F5F0] rounded-xl mt-4" />
      </div>
    </div>
  );
}

/* ── info row ── */
function InfoRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E4E8E1] last:border-0">
      <span className="flex items-center gap-2 text-[13px] text-[#5B6559]">
        <Icon size={13} className="shrink-0" aria-hidden="true" /> {label}
      </span>
      <span
        className={`text-sm font-semibold ${accent ? "text-[#256628]" : "text-[#1F2A1C]"}`}
      >
        {value}
      </span>
    </div>
  );
}

/* filter options */
const STATUS_FILTERS = [
  "All",
  "pending",
  "confirmed",
  "shipped",
  "completed",
  "cancelled",
];
const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: High→Low", value: "price_desc" },
  { label: "Price: Low→High", value: "price_asc" },
];

/* ══════════════════════════════════════════════════════ */
export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [sortBy, setSort] = useState("newest");
  const [toast, setToast] = useState(null);

  /* ── fetch ── */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders?.filter((o) => o.listing) ?? []);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to fetch orders.",
        false,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ── filter + sort ── */
  useEffect(() => {
    let data = [...orders];
    if (search.trim())
      data = data.filter(
        (o) =>
          o.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
          o.seller?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusF !== "All") data = data.filter((o) => o.orderStatus === statusF);
    if (sortBy === "newest")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "price_desc")
      data.sort((a, b) => b.totalPrice - a.totalPrice);
    if (sortBy === "price_asc")
      data.sort((a, b) => a.totalPrice - b.totalPrice);
    setFiltered(data);
  }, [orders, search, statusF, sortBy]);

  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── stats ── */
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const doneCount = orders.filter((o) => o.orderStatus === "completed").length;

  const activeFilters = [
    search.trim() ? 1 : 0,
    statusF !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setSearch("");
    setStatusF("All");
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#1F2A1C] font-['Inter',sans-serif]">
      {/* toast */}
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          className={`fixed top-20 right-5 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5
          rounded-xl border bg-white text-sm font-semibold shadow-lg animate-[slideRight_0.3s_ease-out] motion-reduce:animate-none ${
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

      <div className={`${container} pt-28 pb-20`}>
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-[#2E7D32] mb-1">
                Buyer dashboard
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                My Orders
              </h1>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className={`${btnOutline} w-fit`}
            >
              <RefreshCw
                size={14}
                className={
                  loading ? "animate-spin motion-reduce:animate-none" : ""
                }
              />{" "}
              Refresh
            </button>
          </div>
        </Reveal>

        {/* ── STATS ── */}
        {!loading && orders.length > 0 && (
          <Reveal delay={60}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: ShoppingBag,
                  label: "Total orders",
                  value: orders.length,
                },
                {
                  icon: Clock,
                  label: "Pending",
                  value: pendingCount,
                },
                {
                  icon: CheckCircle2,
                  label: "Completed",
                  value: doneCount,
                },
                {
                  icon: TrendingUp,
                  label: "Total spent",
                  value: `₹${totalSpent.toLocaleString("en-IN")}`,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={`${card} flex items-center gap-4 px-5 py-4`}
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold truncate">{value}</p>
                    <p className="text-[13px] text-[#5B6559] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── FILTERS ── */}
        <Reveal delay={100}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* search */}
            <label
              className={`flex-1 flex items-center gap-2.5 px-4 focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/20 bg-white border border-[#D5DBD0] rounded-xl h-11 transition-colors duration-200`}
            >
              <span className="sr-only">Search orders</span>
              <Search size={15} className="text-[#7A8576] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product or seller name…"
                className="w-full bg-transparent outline-none text-[14px] text-[#1F2A1C] placeholder:text-[#7A8576]"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className={`text-[#7A8576] hover:text-[#1F2A1C] transition-colors duration-200 rounded ${focusRing}`}
                >
                  <X size={14} />
                </button>
              )}
            </label>

            {/* sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort orders"
                className={`${field} appearance-none pl-4 pr-9 cursor-pointer w-full sm:w-auto`}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8576] pointer-events-none"
              />
            </div>
          </div>

          {/* status filter pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide"
            role="group"
            aria-label="Filter orders by status"
          >
            {STATUS_FILTERS.map((f) => {
              const st = ORDER_STATUS[f];
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={statusF === f}
                  onClick={() => setStatusF(f)}
                  className={`flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium
                    whitespace-nowrap transition-colors duration-200 ${focusRing} ${
                      statusF === f
                        ? "bg-[#2E7D32] text-white"
                        : "bg-white text-[#5B6559] border border-[#D5DBD0] hover:border-[#2E7D32] hover:text-[#2E7D32]"
                    }`}
                >
                  {st && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusF === f ? "bg-white" : st.dot}`}
                    />
                  )}
                  {f === "All" ? "All orders" : st?.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-6 min-h-[28px]">
            <p className="text-[13px] text-[#5B6559]" aria-live="polite">
              {loading
                ? "Loading…"
                : `${filtered.length} of ${orders.length} orders`}
            </p>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className={`flex items-center gap-1.5 text-[13px] font-medium text-[#256628] bg-[#EAF4E6] hover:bg-[#DCEED6] px-3 py-1.5 rounded-full transition-colors duration-200 ${focusRing}`}
              >
                <X size={12} /> Clear {activeFilters} filter
                {activeFilters > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </Reveal>

        {/* ── LOADING ── */}
        {loading && (
          <div className="grid lg:grid-cols-2 gap-5">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} />
              ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && orders.length === 0 && (
          <Reveal>
            <div
              className={`${card} flex flex-col items-center justify-center py-20 px-6 text-center`}
            >
              <span className="grid place-items-center w-16 h-16 rounded-2xl bg-[#EAF4E6] text-[#2E7D32] mb-5">
                <ShoppingBag size={28} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold mb-2">No orders yet</h2>
              <p className="text-[#5B6559] text-sm max-w-xs leading-relaxed">
                Your order history will appear here once you make your first
                purchase.
              </p>
              <a href="/listings" className={`${btnPrimary} mt-6`}>
                Browse Marketplace <ArrowRight size={15} />
              </a>
            </div>
          </Reveal>
        )}

        {/* ── NO FILTER RESULTS ── */}
        {!loading && orders.length > 0 && filtered.length === 0 && (
          <Reveal>
            <div
              className={`${card} flex flex-col items-center py-16 px-6 text-center`}
            >
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#F6F8F4] text-[#7A8576] mb-4">
                <Filter size={24} aria-hidden="true" />
              </span>
              <p className="font-semibold mb-1">No orders match your filters</p>
              <p className="text-sm text-[#5B6559]">
                Try a different search or status.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className={`${btnOutline} mt-5`}
              >
                Clear filters
              </button>
            </div>
          </Reveal>
        )}

        {/* ── ORDER CARDS ── */}
        {!loading && filtered.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-5">
            {filtered.map((order, i) => {
              const st = getOrderStatus(order.orderStatus);
              const payColor =
                PAYMENT_COLOR[order.paymentStatus] ?? PAYMENT_COLOR.pending;
              const StatusIcon = st.icon;

              return (
                <Reveal key={order._id} delay={(i % 2) * 80}>
                  <div
                    className={`group h-full overflow-hidden ${card} hover:shadow-md transition-shadow duration-200`}
                  >
                    {/* image */}
                    <div className="relative h-44 overflow-hidden bg-[#EAF4E6]">
                      <img
                        src={order.listing?.image}
                        alt={order.listing?.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
                      />

                      {/* order status badge */}
                      <span
                        className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${st.bg} ${st.color}`}
                      >
                        <StatusIcon size={12} aria-hidden="true" />
                        {st.label}
                      </span>

                      {/* payment badge */}
                      <span
                        className={`absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${payColor}`}
                      >
                        <CreditCard size={12} aria-hidden="true" />
                        <span className="sr-only">Payment:</span>
                        {order.paymentStatus}
                      </span>
                    </div>

                    {/* body */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <h2 className="text-lg font-semibold leading-snug min-w-0 truncate">
                          {order.listing?.title}
                        </h2>
                        <p className="text-xl font-bold text-[#256628] shrink-0">
                          ₹{order.totalPrice?.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* seller info */}
                      <div className="flex items-center gap-3 mb-4 p-3.5 rounded-xl bg-[#F6F8F4] border border-[#E4E8E1]">
                        <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#EAF4E6] text-[#2E7D32] shrink-0">
                          <User size={16} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {order.seller?.name}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-[#5B6559] mt-0.5 truncate">
                            <Mail size={11} aria-hidden="true" />{" "}
                            {order.seller?.email}
                          </p>
                        </div>
                      </div>

                      {/* order details */}
                      <div className="px-1">
                        <InfoRow
                          icon={Hash}
                          label="Quantity"
                          value={`${order.quantity} units`}
                        />
                        <InfoRow
                          icon={IndianRupee}
                          label="Total"
                          value={`₹${order.totalPrice?.toLocaleString("en-IN")}`}
                          accent
                        />
                        <InfoRow
                          icon={Calendar}
                          label="Ordered"
                          value={new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        />
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
