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
      className={`transition-all duration-500 ease-out
        ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── status config ── */
const ORDER_STATUS = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/12  border-amber-400/30",
    dot: "bg-amber-400",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-sky-400",
    bg: "bg-sky-400/12    border-sky-400/30",
    dot: "bg-sky-400",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "text-[#A8E063]",
    bg: "bg-[#5C9E31]/13 border-[#5C9E31]/32",
    dot: "bg-[#A8E063]",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/12    border-red-400/30",
    dot: "bg-red-400",
    icon: XCircle,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-400",
    bg: "bg-purple-400/12 border-purple-400/30",
    dot: "bg-purple-400",
    icon: Truck,
  },
};
const getOrderStatus = (s) => ORDER_STATUS[s] ?? ORDER_STATUS.pending;

const PAYMENT_COLOR = {
  paid: "text-[#A8E063] bg-[#5C9E31]/12 border-[#5C9E31]/30",
  pending: "text-amber-400 bg-amber-400/12 border-amber-400/30",
  failed: "text-red-400   bg-red-400/12   border-red-400/30",
};

/* ── skeleton ── */
function Skeleton() {
  return (
    <div className="rounded-2xl bg-white/4 border border-white/8 overflow-hidden animate-pulse">
      <div className="h-52 bg-white/8" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-3 bg-white/7  rounded-full w-1/2" />
        <div className="h-3 bg-white/7  rounded-full w-2/3" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-10 bg-white/6 rounded-xl" />
          <div className="h-10 bg-white/6 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── info row ── */
function InfoRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="flex items-center gap-2 text-xs text-white/40">
        <Icon size={12} className="shrink-0" /> {label}
      </span>
      <span
        className={`text-sm font-semibold ${accent ? "text-[#A8E063]" : "text-white/80"}`}
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

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-['Inter',sans-serif]">
      {/* toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
          rounded-2xl border text-sm font-semibold shadow-2xl animate-[slideRight_0.3s_ease-out] ${
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

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        {/* ── HEADER ── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <p className="font-['Space_Mono',monospace] text-xs text-[#5C9E31] tracking-widest uppercase mb-2">
                Buyer Dashboard
              </p>
              <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl font-bold">
                My Orders
              </h1>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10
                text-white/55 hover:text-white hover:bg-white/10 text-sm font-medium transition-all w-fit"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </Reveal>

        {/* ── STATS ── */}
        {!loading && orders.length > 0 && (
          <Reveal delay={60}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                {
                  icon: ShoppingBag,
                  label: "Total Orders",
                  value: orders.length,
                  color: "text-white",
                },
                {
                  icon: Clock,
                  label: "Pending",
                  value: pendingCount,
                  color: "text-amber-400",
                },
                {
                  icon: CheckCircle2,
                  label: "Completed",
                  value: doneCount,
                  color: "text-[#A8E063]",
                },
                {
                  icon: TrendingUp,
                  label: "Total Spent",
                  value: `₹${totalSpent.toLocaleString("en-IN")}`,
                  color: "text-[#A8E063]",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl bg-white/4 border border-white/8 px-5 py-4"
                >
                  <Icon size={20} className={`shrink-0 ${color}`} />
                  <div>
                    <p
                      className={`font-['Playfair_Display',serif] text-xl font-bold ${color}`}
                    >
                      {value}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{label}</p>
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
            <div
              className="flex-1 flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl
              px-4 py-3 focus-within:border-[#5C9E31]/45 transition-all"
            >
              <Search size={15} className="text-white/30 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product or seller name…"
                className="w-full bg-transparent outline-none text-[14px] text-white placeholder:text-white/25"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-white/25 hover:text-white/60 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-9 py-3
                  text-[14px] text-white/70 outline-none hover:border-white/20 focus:border-[#5C9E31]/45
                  transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option
                    key={s.value}
                    value={s.value}
                    className="bg-[#0E140D]"
                  >
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
            </div>
          </div>

          {/* status filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {STATUS_FILTERS.map((f) => {
              const st = ORDER_STATUS[f];
              return (
                <button
                  key={f}
                  onClick={() => setStatusF(f)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                    whitespace-nowrap transition-all ${
                      statusF === f
                        ? "bg-[#5C9E31] text-white shadow-[0_0_16px_rgba(92,158,49,0.4)]"
                        : "bg-white/5 text-white/50 border border-white/8 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {st && (
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  )}
                  {f === "All" ? "All Orders" : st?.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-white/35">
              {loading
                ? "Loading…"
                : `${filtered.length} of ${orders.length} orders`}
            </p>
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusF("All");
                }}
                className="flex items-center gap-1.5 text-xs text-[#A8E063] hover:text-white
                  border border-[#5C9E31]/30 hover:border-white/20 px-3 py-1.5 rounded-full transition-all"
              >
                <X size={11} /> Clear {activeFilters} filter
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
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="grid place-items-center w-20 h-20 rounded-3xl bg-white/4 border border-white/8 mb-6">
                <ShoppingBag size={36} className="text-white/15" />
              </span>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold mb-2">
                No orders yet
              </h2>
              <p className="text-white/35 text-sm max-w-xs leading-relaxed">
                Your order history will appear here once you make your first
                purchase.
              </p>
              <a
                href="/listings"
                className="mt-7 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5C9E31] hover:bg-[#4E8A28]
                  font-semibold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(92,158,49,0.35)]"
              >
                Browse Marketplace <ArrowRight size={15} />
              </a>
            </div>
          </Reveal>
        )}

        {/* ── NO FILTER RESULTS ── */}
        {!loading && orders.length > 0 && filtered.length === 0 && (
          <Reveal>
            <div className="flex flex-col items-center py-20 text-center">
              <Filter size={36} className="text-white/15 mb-4" />
              <p className="font-semibold mb-1">No orders match your filters</p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusF("All");
                }}
                className="mt-4 px-5 py-2 text-sm rounded-xl border border-white/12 hover:bg-white/6 transition-all"
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
              const StatusIcon = st.icon;
              const payColor =
                PAYMENT_COLOR[order.paymentStatus] ?? PAYMENT_COLOR.pending;

              return (
                <Reveal key={order._id} delay={i * 60}>
                  <div
                    className="group rounded-2xl bg-white/4 border border-white/8 hover:border-white/16
                    overflow-hidden hover:shadow-[0_16px_50px_rgba(0,0,0,0.45)] transition-all duration-300"
                  >
                    {/* image */}
                    <div className="relative h-52 overflow-hidden bg-white/6">
                      <img
                        src={order.listing?.image}
                        alt={order.listing?.title}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                      {/* order status badge */}
                      <div
                        className={`absolute top-3 left-3 flex items-center gap-1.5 text-[11px]
                        font-['Space_Mono',monospace] uppercase tracking-wider px-3 py-1.5
                        rounded-full border backdrop-blur-sm ${st.bg} ${st.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${st.dot} ${order.orderStatus === "confirmed" || order.orderStatus === "shipped" ? "animate-pulse" : ""}`}
                        />
                        {st.label}
                      </div>

                      {/* payment badge */}
                      <div
                        className={`absolute top-3 right-3 flex items-center gap-1.5 text-[11px]
                        font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm ${payColor}`}
                      >
                        <CreditCard size={11} /> {order.paymentStatus}
                      </div>

                      {/* title + price overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h2 className="font-['Playfair_Display',serif] text-lg font-bold leading-snug drop-shadow-lg line-clamp-1">
                          {order.listing?.title}
                        </h2>
                        <p className="text-[#A8E063] font-bold text-xl mt-0.5 drop-shadow-lg">
                          ₹{order.totalPrice?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* body */}
                    <div className="p-6">
                      {/* seller info */}
                      <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-white/4 border border-white/7">
                        <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#5C9E31]/15 text-[#A8E063] shrink-0">
                          <User size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {order.seller?.name}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-white/40 mt-0.5 truncate">
                            <Mail size={10} /> {order.seller?.email}
                          </p>
                        </div>
                      </div>

                      {/* order details */}
                      <div className="rounded-xl bg-white/3 border border-white/6 px-4 py-1 mb-5">
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

                      {/* status + payment footer */}
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5
                          rounded-xl border flex-1 justify-center ${st.bg} ${st.color}`}
                        >
                          <StatusIcon size={15} /> {st.label}
                        </div>
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5
                          rounded-xl border flex-1 justify-center ${payColor}`}
                        >
                          <CreditCard size={15} />
                          {order.paymentStatus?.charAt(0).toUpperCase() +
                            order.paymentStatus?.slice(1)}
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
